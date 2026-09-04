/**
 * ORBIE — Memory Persistence Adapter (TEST ONLY)
 * In-memory non-durable storage for fast isolated unit tests.
 * MUST NOT be used in production.
 */

import {
  IPersistenceAdapter,
  IUserRepository,
  IProfileRepository,
  IEventRepository,
  IPreferencesRepository,
  IWalletRepository,
  ICouponRepository,
  IDailyCreditRepository,
  INotificationRepository,
  IJournalRepository,
} from '../interfaces';
import {
  UserEntity,
  ProfileEntity,
  EventEntity,
  PreferencesEntity,
  WalletEntity,
  LedgerEntryEntity,
  EntitlementEntity,
  CampaignEntity,
  CouponEntity,
  CouponRedemptionEntity,
  DistributionEntity,
  CommunicationDraftEntity,
  AdminAuditLogEntity,
  UserCheckInStateEntity,
  NotificationEntity,
  JournalEntryEntity,
  PersistenceStatus,
} from '../types';

export class MemoryPersistenceAdapter implements IPersistenceAdapter {
  public readonly driver = 'memory';
  public readonly isDurable = false;
  private usersMap = new Map<string, UserEntity>();
  private profilesMap = new Map<string, ProfileEntity>();
  private eventsMap = new Map<string, EventEntity>();
  private preferencesMap = new Map<string, PreferencesEntity>();
  private walletsMap = new Map<string, WalletEntity>();
  private ledgerMap = new Map<string, LedgerEntryEntity[]>();
  private entitlementsMap = new Map<string, EntitlementEntity[]>();
  private campaignsMap = new Map<string, CampaignEntity>();
  private couponsMap = new Map<string, CouponEntity>();
  private redemptionsList: CouponRedemptionEntity[] = [];
  private distributionsList: DistributionEntity[] = [];
  private draftsList: CommunicationDraftEntity[] = [];
  private auditLogsList: AdminAuditLogEntity[] = [];
  private dailyCreditsMap = new Map<string, UserCheckInStateEntity>();
  private notificationsMap = new Map<string, NotificationEntity[]>();
  private journalsMap = new Map<string, JournalEntryEntity[]>();

  public async init(): Promise<void> {}
  public async close(): Promise<void> {}

  public getStatus(): PersistenceStatus {
    return {
      driver: 'memory',
      connected: true,
      isDurable: false,
      details: 'In-memory transient test adapter (DO NOT USE IN PRODUCTION)',
    };
  }

  public readonly users: IUserRepository = {
    get: async (uid: string) => this.usersMap.get(uid) || null,
    save: async (user: UserEntity) => {
      this.usersMap.set(user.uid, { ...user });
      return { ...user };
    },
    list: async () => Array.from(this.usersMap.values()).map((u) => ({ ...u })),
    delete: async (uid: string) => this.usersMap.delete(uid),
  };

  public readonly profiles: IProfileRepository = {
    get: async (id: string) => this.profilesMap.get(id) || null,
    findByOwner: async (ownerUid: string) =>
      Array.from(this.profilesMap.values())
        .filter((p) => p.ownerUid === ownerUid)
        .map((p) => ({ ...p })),
    getPrimary: async (ownerUid: string) => {
      for (const p of this.profilesMap.values()) {
        if (p.ownerUid === ownerUid && p.isPrimary) return { ...p };
      }
      return null;
    },
    save: async (profile: ProfileEntity) => {
      this.profilesMap.set(profile.id, { ...profile });
      return { ...profile };
    },
    delete: async (id: string, ownerUid: string) => {
      const p = this.profilesMap.get(id);
      if (p && p.ownerUid === ownerUid) {
        return this.profilesMap.delete(id);
      }
      return false;
    },
  };

  public readonly events: IEventRepository = {
    get: async (id: string) => this.eventsMap.get(id) || null,
    findByOwner: async (ownerUid: string) =>
      Array.from(this.eventsMap.values())
        .filter((e) => e.ownerUid === ownerUid)
        .map((e) => ({ ...e })),
    save: async (event: EventEntity) => {
      this.eventsMap.set(event.id, { ...event });
      return { ...event };
    },
    delete: async (id: string, ownerUid: string) => {
      const e = this.eventsMap.get(id);
      if (e && e.ownerUid === ownerUid) {
        return this.eventsMap.delete(id);
      }
      return false;
    },
  };

  public readonly preferences: IPreferencesRepository = {
    get: async (ownerUid: string) => this.preferencesMap.get(ownerUid) || null,
    save: async (prefs: PreferencesEntity) => {
      this.preferencesMap.set(prefs.ownerUid, { ...prefs });
      return { ...prefs };
    },
  };

  public readonly wallets: IWalletRepository = {
    get: async (userUid: string) => this.walletsMap.get(userUid) || null,
    save: async (wallet: WalletEntity) => {
      this.walletsMap.set(wallet.userUid, { ...wallet });
      return { ...wallet };
    },
    getLedger: async (userUid: string) => {
      const list = this.ledgerMap.get(userUid) || [];
      return list.map((e) => ({ ...e }));
    },
    addLedgerEntry: async (entry: LedgerEntryEntity) => {
      const list = this.ledgerMap.get(entry.userUid) || [];
      list.unshift({ ...entry });
      this.ledgerMap.set(entry.userUid, list);
    },
    getEntitlements: async (userUid: string) => {
      const list = this.entitlementsMap.get(userUid) || [];
      return list.map((e) => ({ ...e }));
    },
    addEntitlement: async (entitlement: EntitlementEntity) => {
      const list = this.entitlementsMap.get(entitlement.userUid) || [];
      list.push({ ...entitlement });
      this.entitlementsMap.set(entitlement.userUid, list);
    },
  };

  public readonly coupons: ICouponRepository = {
    getCampaign: async (id: string) => this.campaignsMap.get(id) || null,
    listCampaigns: async () => Array.from(this.campaignsMap.values()).map((c) => ({ ...c })),
    saveCampaign: async (campaign: CampaignEntity) => {
      this.campaignsMap.set(campaign.id, { ...campaign });
    },
    deleteCampaign: async (id: string) => {
      return this.campaignsMap.delete(id);
    },
    getCoupon: async (code: string) => this.couponsMap.get(code.toUpperCase()) || null,
    getCouponByToken: async (token: string) => {
      for (const c of this.couponsMap.values()) {
        if (c.token === token || c.qrReference === token) return { ...c };
      }
      return null;
    },
    listCoupons: async () => Array.from(this.couponsMap.values()).map((c) => ({ ...c })),
    saveCoupon: async (coupon: CouponEntity) => {
      this.couponsMap.set(coupon.code.toUpperCase(), { ...coupon });
    },
    getRedemptionsByUser: async (userUid: string) => {
      return this.redemptionsList.filter((r) => r.userUid === userUid).map((r) => ({ ...r }));
    },
    getAllRedemptions: async () => {
      return this.redemptionsList.map((r) => ({ ...r }));
    },
    addRedemption: async (redemption: CouponRedemptionEntity) => {
      this.redemptionsList.push({ ...redemption });
    },
    listDistributions: async () => {
      return this.distributionsList.map((d) => ({ ...d }));
    },
    saveDistribution: async (dist: DistributionEntity) => {
      const idx = this.distributionsList.findIndex((d) => d.id === dist.id);
      if (idx >= 0) {
        this.distributionsList[idx] = { ...dist };
      } else {
        this.distributionsList.unshift({ ...dist });
      }
    },
    listAuditLogs: async () => {
      return this.auditLogsList.map((l) => ({ ...l }));
    },
    addAuditLog: async (log: AdminAuditLogEntity) => {
      this.auditLogsList.unshift({ ...log });
    },
  };

  public readonly dailyCredits: IDailyCreditRepository = {
    getState: async (userUid: string) => this.dailyCreditsMap.get(userUid) || null,
    saveState: async (state: UserCheckInStateEntity) => {
      this.dailyCreditsMap.set(state.userUid, { ...state });
    },
  };

  public readonly notifications: INotificationRepository = {
    findByOwner: async (ownerUid: string) => {
      const list = this.notificationsMap.get(ownerUid) || [];
      return list.map((n) => ({ ...n }));
    },
    listAll: async () => {
      const all: NotificationEntity[] = [];
      for (const list of this.notificationsMap.values()) {
        all.push(...list);
      }
      return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    save: async (notification: NotificationEntity) => {
      const list = this.notificationsMap.get(notification.ownerUid) || [];
      const idx = list.findIndex((n) => n.id === notification.id);
      if (idx >= 0) {
        list[idx] = { ...notification };
      } else {
        list.unshift({ ...notification });
      }
      this.notificationsMap.set(notification.ownerUid, list);
    },
  };

  public readonly communications = {
    listDrafts: async () => this.draftsList.map((d) => ({ ...d })),
    saveDraft: async (draft: CommunicationDraftEntity) => {
      const idx = this.draftsList.findIndex((d) => d.id === draft.id);
      if (idx >= 0) {
        this.draftsList[idx] = { ...draft };
      } else {
        this.draftsList.unshift({ ...draft });
      }
    },
    getDraft: async (id: string) => {
      const draft = this.draftsList.find((d) => d.id === id);
      return draft ? { ...draft } : null;
    },
  };

  public readonly journals: IJournalRepository = {
    findByOwner: async (ownerUid: string) => {
      const list = this.journalsMap.get(ownerUid) || [];
      return list.map((j) => ({ ...j }));
    },
    save: async (entry: JournalEntryEntity) => {
      const list = this.journalsMap.get(entry.ownerUid) || [];
      const idx = list.findIndex((x) => x.id === entry.id);
      if (idx >= 0) list[idx] = { ...entry };
      else list.unshift({ ...entry });
      this.journalsMap.set(entry.ownerUid, list);
    },
  };
}
