import { Campaign, Coupon, CouponRedemption, CouponWithdrawalReceipt, UserCouponAlert } from './types';
import { walletService } from '../wallet/walletService';

export class CouponService {
  private campaigns: Map<string, Campaign> = new Map();
  private coupons: Map<string, Coupon> = new Map();
  private redemptions: CouponRedemption[] = [];

  constructor() {
    this.seedDefaultCampaignAndCoupon();
  }

  /**
   * Seed the official canonical campaign and coupon:
   * 5 credits per withdrawal, 7 days validity, 1 withdrawal per 24 hours (max 7 withdrawals = 35 total credits distributed over 7 days)
   */
  public seedDefaultCampaignAndCoupon(): void {
    const now = new Date();
    const startDate = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
    const endDate = new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString();

    const campaignId = 'camp-orb-welcome-7d';
    if (!this.campaigns.has(campaignId)) {
      const campaign: Campaign = {
        id: campaignId,
        title: 'Campanha de Boas-Vindas ORBIE 7 Dias',
        description: 'Receba 5 créditos por dia durante 7 dias (1 saque a cada 24 horas)',
        creditsPerWithdrawal: 5,
        validityDays: 7,
        withdrawalFrequencyHours: 24,
        maxUsesPerUser: 7,
        startDate,
        endDate,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      this.campaigns.set(campaignId, campaign);

      const couponCode = 'ORB-WELCOME-7D';
      const coupon: Coupon = {
        code: couponCode,
        campaignId,
        qrReference: 'qr_ref_orb_7d_welcome_sec99a',
        maxTotalRedemptions: 100000,
        currentTotalRedemptions: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      this.coupons.set(couponCode.toUpperCase(), coupon);
    }
  }

  public createCampaign(data: Omit<Campaign, 'id' | 'createdAt'>): Campaign {
    const id = `camp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const campaign: Campaign = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  public getCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  public getCampaign(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  public createCoupon(
    campaignId: string,
    customCode?: string,
    maxTotalRedemptions?: number
  ): Coupon {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const code = (customCode || `ORB-${Math.random().toString(36).substring(2, 8)}`).toUpperCase();
    const qrReference = `qr_ref_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;

    const coupon: Coupon = {
      code,
      campaignId,
      qrReference,
      maxTotalRedemptions,
      currentTotalRedemptions: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    this.coupons.set(code, coupon);
    return coupon;
  }

  public getCoupons(): Coupon[] {
    return Array.from(this.coupons.values());
  }

  public findCouponByCodeOrQR(input: string): Coupon | null {
    const cleanInput = (input || '').trim();
    if (!cleanInput) return null;

    // Search by code (case-insensitive)
    const upperCode = cleanInput.toUpperCase();
    if (this.coupons.has(upperCode)) {
      return this.coupons.get(upperCode)!;
    }

    // Search by QR reference token
    for (const coupon of this.coupons.values()) {
      if (coupon.qrReference === cleanInput) {
        return coupon;
      }
    }

    return null;
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
  public redeemCoupon(userUid: string, codeOrQrRef: string): CouponWithdrawalReceipt {
    if (!userUid) {
      throw new Error('User authentication required for coupon redemption');
    }

    const coupon = this.findCouponByCodeOrQR(codeOrQrRef);
    if (!coupon) {
      throw new Error('Cupom inválido ou não encontrado.');
    }

    if (coupon.status !== 'active') {
      throw new Error('Este cupom está inativo ou expirado.');
    }

    if (coupon.maxTotalRedemptions && coupon.currentTotalRedemptions >= coupon.maxTotalRedemptions) {
      throw new Error('Este cupom atingiu o limite máximo global de utilizações.');
    }

    const campaign = this.campaigns.get(coupon.campaignId);
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

    // Check user's redemption history for this specific coupon
    const userRedemptions = this.redemptions
      .filter((r) => r.userUid === userUid && r.couponCode === coupon.code)
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
    const grantResult = walletService.grantCredits(
      userUid,
      campaign.creditsPerWithdrawal,
      'COUPON_BENEFIT',
      description,
      coupon.code
    );

    // Record the redemption
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
    this.redemptions.push(redemption);
    coupon.currentTotalRedemptions += 1;

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
   * Retrieves active coupon alerts for a user:
   * Returns whether a withdrawal is available right now for an active user coupon
   */
  public getUserCouponAlerts(userUid: string): UserCouponAlert[] {
    const alerts: UserCouponAlert[] = [];
    const now = Date.now();

    // Group user's redemptions by couponCode
    const userRedemptionsByCoupon = new Map<string, CouponRedemption[]>();
    for (const r of this.redemptions) {
      if (r.userUid === userUid) {
        const list = userRedemptionsByCoupon.get(r.couponCode) || [];
        list.push(r);
        userRedemptionsByCoupon.set(r.couponCode, list);
      }
    }

    for (const [code, redemptions] of userRedemptionsByCoupon.entries()) {
      const coupon = this.coupons.get(code);
      if (!coupon || coupon.status !== 'active') continue;

      const campaign = this.campaigns.get(coupon.campaignId);
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

  public getRedemptions(filter?: { campaignId?: string; couponCode?: string; userUid?: string }): CouponRedemption[] {
    return this.redemptions.filter((r) => {
      if (filter?.campaignId && r.campaignId !== filter.campaignId) return false;
      if (filter?.couponCode && r.couponCode !== filter.couponCode) return false;
      if (filter?.userUid && r.userUid !== filter.userUid) return false;
      return true;
    });
  }

  public resetForTest(): void {
    this.campaigns.clear();
    this.coupons.clear();
    this.redemptions = [];
    this.seedDefaultCampaignAndCoupon();
  }
}

export const couponService = new CouponService();
