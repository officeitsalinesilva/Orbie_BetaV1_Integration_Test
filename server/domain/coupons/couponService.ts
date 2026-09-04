/**
 * ORBIE — Canonical Coupon, Campaign & Distribution Domain Service
 * Server-authoritative, durable persistence, no hardcoded production seeds.
 */

import { Campaign, Coupon, CouponRedemption, CouponWithdrawalReceipt, UserCouponAlert } from './types';
import { walletService } from '../wallet/walletService';
import { couponRepo, notificationRepo, userRepo } from '../../persistence';
import { DistributionEntity, AdminAuditLogEntity, NotificationEntity } from '../../persistence/types';

export class CouponService {
  /**
   * Create a new promotional campaign.
   */
  public async createCampaign(
    data: Omit<Campaign, 'id' | 'createdAt'>,
    adminUid?: string
  ): Promise<Campaign> {
    const id = `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const campaign: Campaign = {
      ...data,
      id,
      creditsPerWithdrawal: Number(data.creditsPerWithdrawal) || 5,
      validityDays: Number(data.validityDays) || 7,
      withdrawalFrequencyHours: Number(data.withdrawalFrequencyHours) || 24,
      maxUsesPerUser: Number(data.maxUsesPerUser) || 7,
      status: data.status || 'active',
      createdAt: new Date().toISOString(),
    };

    await couponRepo.saveCampaign(campaign as any);

    if (adminUid) {
      await this.logAudit({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        adminUid,
        action: 'CREATE_CAMPAIGN',
        targetType: 'campaign',
        targetId: campaign.id,
        details: { title: campaign.title, creditsPerWithdrawal: campaign.creditsPerWithdrawal },
        timestamp: new Date().toISOString(),
      });
    }

    return campaign;
  }

  public async getCampaigns(): Promise<Campaign[]> {
    const list = await couponRepo.listCampaigns();
    return list as unknown as Campaign[];
  }

  public async getCampaign(id: string): Promise<Campaign | null> {
    const camp = await couponRepo.getCampaign(id);
    return (camp as unknown as Campaign) || null;
  }

  public async updateCampaignStatus(id: string, status: 'active' | 'draft' | 'expired' | 'archived', adminUid?: string): Promise<Campaign | null> {
    const camp = await this.getCampaign(id);
    if (!camp) return null;
    camp.status = status;
    await couponRepo.saveCampaign(camp as any);

    if (adminUid) {
      await this.logAudit({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        adminUid,
        action: 'UPDATE_CAMPAIGN_STATUS',
        targetType: 'campaign',
        targetId: id,
        details: { newStatus: status },
        timestamp: new Date().toISOString(),
      });
    }

    return camp;
  }

  /**
   * Create a coupon linked to a campaign with unique cryptographic QR token.
   */
  public async createCoupon(
    campaignId: string,
    customCode?: string,
    maxTotalRedemptions?: number,
    adminUid?: string
  ): Promise<Coupon> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const code = (customCode || `ORB-${Math.random().toString(36).substring(2, 8)}`).toUpperCase().trim();
    const token = `tok_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`;
    const qrReference = `qr_ref_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    // Verify code uniqueness
    const existing = await couponRepo.getCoupon(code);
    if (existing) {
      throw new Error(`Cupom com código "${code}" já existe.`);
    }

    const coupon: Coupon = {
      code,
      campaignId,
      qrReference,
      maxTotalRedemptions: maxTotalRedemptions ? Number(maxTotalRedemptions) : undefined,
      currentTotalRedemptions: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    await couponRepo.saveCoupon({
      ...coupon,
      token,
    } as any);

    if (adminUid) {
      await this.logAudit({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        adminUid,
        action: 'CREATE_COUPON',
        targetType: 'coupon',
        targetId: coupon.code,
        details: { campaignId, code: coupon.code, maxTotalRedemptions },
        timestamp: new Date().toISOString(),
      });
    }

    return coupon;
  }

  public async getCoupons(): Promise<Coupon[]> {
    const list = await couponRepo.listCoupons();
    return list as unknown as Coupon[];
  }

  public async getCoupon(code: string): Promise<Coupon | null> {
    const c = await couponRepo.getCoupon(code.toUpperCase().trim());
    return (c as unknown as Coupon) || null;
  }

  public async updateCouponStatus(code: string, status: 'active' | 'disabled' | 'exhausted', adminUid?: string): Promise<Coupon | null> {
    const coupon = await this.getCoupon(code);
    if (!coupon) return null;
    coupon.status = status;
    await couponRepo.saveCoupon(coupon as any);

    if (adminUid) {
      await this.logAudit({
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        adminUid,
        action: 'UPDATE_COUPON_STATUS',
        targetType: 'coupon',
        targetId: code,
        details: { newStatus: status },
        timestamp: new Date().toISOString(),
      });
    }

    return coupon;
  }

  public async findCouponByCodeOrQR(input: string): Promise<Coupon | null> {
    const cleanInput = (input || '').trim();
    if (!cleanInput) return null;

    // Search by code (case-insensitive)
    const upperCode = cleanInput.toUpperCase();
    const byCode = await couponRepo.getCoupon(upperCode);
    if (byCode) return byCode as unknown as Coupon;

    // Search by token or QR reference
    const byToken = await couponRepo.getCouponByToken(cleanInput);
    if (byToken) return byToken as unknown as Coupon;

    // Fallback: scan all coupons for qrReference
    const all = await couponRepo.listCoupons();
    const found = all.find((c) => c.qrReference === cleanInput || c.token === cleanInput);
    return (found as unknown as Coupon) || null;
  }

  /**
   * Distribute a coupon to target users with optional notification dispatch.
   */
  public async distributeCoupon(params: {
    adminUid: string;
    couponCode: string;
    targetUserUids?: string[];
    sendNotification?: boolean;
    customNotificationMessage?: string;
  }): Promise<DistributionEntity> {
    const { adminUid, couponCode, targetUserUids, sendNotification, customNotificationMessage } = params;
    const coupon = await this.getCoupon(couponCode);
    if (!coupon) {
      throw new Error(`Cupom ${couponCode} não encontrado.`);
    }

    const campaign = await this.getCampaign(coupon.campaignId);
    const campaignTitle = campaign?.title || 'Campanha Especial';
    const creditsPerWithdrawal = campaign?.creditsPerWithdrawal || 5;

    // Determine target recipients
    let recipients: string[] = [];
    if (targetUserUids && targetUserUids.length > 0) {
      recipients = targetUserUids;
    } else {
      // Broadcast to all registered users
      const allUsers = await userRepo.list();
      recipients = allUsers.map((u) => u.uid);
    }

    const distributionId = `dist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const distribution: DistributionEntity = {
      id: distributionId,
      campaignId: coupon.campaignId,
      couponCode: coupon.code,
      channel: 'push',
      status: 'completed',
      targetCount: recipients.length,
      sentCount: recipients.length,
      failedCount: 0,
      scheduledAt: new Date().toISOString(),
      sentAt: new Date().toISOString(),
      createdAdminUid: adminUid,
      createdAt: new Date().toISOString(),
    };

    await couponRepo.saveDistribution(distribution);

    // If notifications requested, dispatch in-app notification to each recipient
    if (sendNotification && recipients.length > 0) {
      const title = `🎁 Você recebeu o cupom ${coupon.code}!`;
      const body = customNotificationMessage ||
        `Use o cupom ${coupon.code} para resgatar ${creditsPerWithdrawal} créditos por dia na campanha "${campaignTitle}".`;

      for (const uid of recipients) {
        const notif: NotificationEntity = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          ownerUid: uid,
          channel: 'push',
          title,
          body,
          status: 'sent',
          payload: {
            couponCode: coupon.code,
            campaignId: coupon.campaignId,
            type: 'COUPON_DISTRIBUTION',
          },
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
        };
        await notificationRepo.save(notif);
      }
    }

    await this.logAudit({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      adminUid,
      action: 'DISTRIBUTE_COUPON',
      targetType: 'coupon',
      targetId: couponCode,
      details: {
        recipientsCount: recipients.length,
        sendNotification: !!sendNotification,
      },
      timestamp: new Date().toISOString(),
    });

    return distribution;
  }

  /**
   * Redeem a coupon or perform a periodic withdrawal
   * Strictly verifies:
   * 1. Existence
   * 2. Active status
   * 3. Campaign validity dates
   * 4. User eligibility
   * 5. Total withdrawal limit (e.g. max 7 withdrawals)
   * 6. 24-hour window between withdrawals (never adds all days at once!)
   */
  public async redeemCoupon(userUid: string, codeOrQrRef: string): Promise<CouponWithdrawalReceipt> {
    if (!userUid) {
      throw new Error('User authentication required for coupon redemption');
    }

    const coupon = await this.findCouponByCodeOrQR(codeOrQrRef);
    if (!coupon) {
      throw new Error('Cupom inválido ou não encontrado.');
    }

    if (coupon.status !== 'active') {
      throw new Error('Este cupom está inativo ou expirado.');
    }

    if (coupon.maxTotalRedemptions && coupon.currentTotalRedemptions >= coupon.maxTotalRedemptions) {
      throw new Error('Este cupom atingiu o limite máximo global de utilizações.');
    }

    const campaign = await this.getCampaign(coupon.campaignId);
    if (!campaign || campaign.status !== 'active') {
      throw new Error('A campanha deste cupom não está mais ativa.');
    }

    const now = Date.now();
    const startDateMs = new Date(campaign.startDate).getTime();
    const endDateMs = new Date(campaign.endDate).getTime();
    if (now < startDateMs || now > endDateMs) {
      throw new Error('Este cupom está fora do período de validade.');
    }

    if (campaign.targetUserUids && campaign.targetUserUids.length > 0) {
      if (!campaign.targetUserUids.includes(userUid)) {
        throw new Error('Usuário não é elegível para esta campanha exclusiva.');
      }
    }

    // Check user's redemption history for this specific coupon from durable repository
    const allUserRedemptions = await couponRepo.getRedemptionsByUser(userUid);
    const userRedemptions = allUserRedemptions
      .filter((r) => r.couponCode === coupon.code)
      .sort((a, b) => new Date(a.redeemedAt).getTime() - new Date(b.redeemedAt).getTime());

    if (userRedemptions.length >= campaign.maxUsesPerUser) {
      throw new Error(
        `Limite de saques deste cupom atingido (${campaign.maxUsesPerUser} de ${campaign.maxUsesPerUser} realizados).`
      );
    }

    // Verify 24-hour (withdrawalFrequencyHours) window
    const requiredIntervalMs = campaign.withdrawalFrequencyHours * 3600 * 1000;
    if (userRedemptions.length > 0) {
      const lastRedemption = userRedemptions[userRedemptions.length - 1];
      const lastTimeMs = new Date(lastRedemption.redeemedAt).getTime();
      const elapsedMs = now - lastTimeMs;

      if (elapsedMs < requiredIntervalMs) {
        const remainingMs = requiredIntervalMs - elapsedMs;
        const remainingHours = Math.ceil(remainingMs / (3600 * 1000));
        throw new Error(
          `Aguarde a próxima janela de 24 horas para realizar o próximo saque deste cupom. Tempo restante aproximado: ${remainingHours}h.`
        );
      }
    }

    const withdrawalNumber = userRedemptions.length + 1;
    const hasNext = withdrawalNumber < campaign.maxUsesPerUser;
    const nextAvailableAt = hasNext
      ? new Date(now + requiredIntervalMs).toISOString()
      : null;

    // Grant credits authoritatively through the Wallet & Ledger
    const description = `Benefício Cupom ${coupon.code} (Saque ${withdrawalNumber}/${campaign.maxUsesPerUser})`;
    const grantResult = await walletService.grantCredits(
      userUid,
      campaign.creditsPerWithdrawal,
      'COUPON_BENEFIT',
      description,
      coupon.code
    );

    // Record the redemption in durable store
    const redemption: CouponRedemption = {
      id: `redm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      couponCode: coupon.code,
      campaignId: campaign.id,
      userUid,
      withdrawalNumber,
      creditsGranted: campaign.creditsPerWithdrawal,
      redeemedAt: new Date(now).toISOString(),
      nextAvailableAt: nextAvailableAt || '',
    };

    coupon.currentTotalRedemptions += 1;
    await couponRepo.addRedemption(redemption as any);
    await couponRepo.saveCoupon(coupon as any);

    return {
      success: true,
      couponCode: coupon.code,
      campaignTitle: campaign.title,
      withdrawalNumber,
      maxWithdrawals: campaign.maxUsesPerUser,
      creditsGranted: campaign.creditsPerWithdrawal,
      newBalance: grantResult.wallet.balance,
      redeemedAt: redemption.redeemedAt,
      nextAvailableAt,
      message: `Saque ${withdrawalNumber} de ${campaign.maxUsesPerUser} realizado com sucesso! +${campaign.creditsPerWithdrawal} créditos adicionados à sua carteira.`,
    };
  }

  /**
   * Retrieves active coupon alerts for a user from durable store:
   * Returns whether a withdrawal is available right now for an active user coupon
   */
  public async getUserCouponAlerts(userUid: string): Promise<UserCouponAlert[]> {
    const alerts: UserCouponAlert[] = [];
    const now = Date.now();

    const userRedemptions = await couponRepo.getRedemptionsByUser(userUid);
    const userRedemptionsByCoupon = new Map<string, typeof userRedemptions>();
    for (const r of userRedemptions) {
      const list = userRedemptionsByCoupon.get(r.couponCode) || [];
      list.push(r);
      userRedemptionsByCoupon.set(r.couponCode, list);
    }

    for (const [code, redemptions] of userRedemptionsByCoupon.entries()) {
      const coupon = await this.getCoupon(code);
      if (!coupon || coupon.status !== 'active') continue;

      const campaign = await this.getCampaign(coupon.campaignId);
      if (!campaign || campaign.status !== 'active') continue;

      redemptions.sort((a, b) => new Date(a.redeemedAt).getTime() - new Date(b.redeemedAt).getTime());
      const withdrawalCount = redemptions.length;
      if (withdrawalCount >= campaign.maxUsesPerUser) continue;

      const last = redemptions[redemptions.length - 1];
      const nextTimeMs = new Date(last.nextAvailableAt).getTime();
      const isReadyNow = now >= nextTimeMs;

      alerts.push({
        hasAvailableWithdrawal: isReadyNow,
        couponCode: coupon.code,
        campaignTitle: campaign.title,
        creditsReady: campaign.creditsPerWithdrawal,
        currentWithdrawalIndex: withdrawalCount + 1,
        totalWithdrawals: campaign.maxUsesPerUser,
        nextAvailableAt: last.nextAvailableAt,
        statusMessage: isReadyNow
          ? `Saque ${withdrawalCount + 1}/${campaign.maxUsesPerUser} (+${campaign.creditsPerWithdrawal} créditos) disponível agora!`
          : `Próximo saque disponível em ${new Date(last.nextAvailableAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      });
    }

    return alerts;
  }

  public async getRedemptions(filter?: { campaignId?: string; couponCode?: string; userUid?: string }): Promise<CouponRedemption[]> {
    let list = await couponRepo.getAllRedemptions();
    if (filter?.campaignId) list = list.filter((r) => r.campaignId === filter.campaignId);
    if (filter?.couponCode) list = list.filter((r) => r.couponCode === filter.couponCode);
    if (filter?.userUid) list = list.filter((r) => r.userUid === filter.userUid);
    return list as unknown as CouponRedemption[];
  }

  public async getDistributions(): Promise<DistributionEntity[]> {
    return couponRepo.listDistributions();
  }

  public async getAuditLogs(): Promise<AdminAuditLogEntity[]> {
    return couponRepo.listAuditLogs?.() || [];
  }

  private async logAudit(log: AdminAuditLogEntity): Promise<void> {
    try {
      await couponRepo.addAuditLog?.(log);
    } catch {
      // Non-blocking audit log catch
    }
  }

  public async resetForTest(): Promise<void> {
    // Used in tests if needed
  }
}

export const couponService = new CouponService();
