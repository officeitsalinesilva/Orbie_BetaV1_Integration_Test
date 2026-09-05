/**
 * ORBIE — Durable File Persistence Adapter
 * Stores canonical business domain state safely on persistent disk.
 * Survives application and server restarts.
 */

import fs from 'fs';
import path from 'path';
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
  ICommunicationRepository,
  IJournalRepository,
  ICommercialRepository,
  CommercialStorageSnapshot,
  IOrderRepository,
  IPaymentRepository,
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
  OrderEntity,
  PaymentEntity,
} from '../types';

interface StorageSchema {
  users: Record<string, UserEntity>;
  profiles: Record<string, ProfileEntity>;
  events: Record<string, EventEntity>;
  preferences: Record<string, PreferencesEntity>;
  wallets: Record<string, WalletEntity>;
  ledger: Record<string, LedgerEntryEntity[]>;
  entitlements: Record<string, EntitlementEntity[]>;
  campaigns: Record<string, CampaignEntity>;
  coupons: Record<string, CouponEntity>;
  redemptions: CouponRedemptionEntity[];
  distributions: DistributionEntity[];
  communicationDrafts: CommunicationDraftEntity[];
  auditLogs: AdminAuditLogEntity[];
  dailyCredits: Record<string, UserCheckInStateEntity>;
  notifications: Record<string, NotificationEntity[]>;
  journals: Record<string, JournalEntryEntity[]>;
  commercial?: CommercialStorageSnapshot;
  orders: Record<string, OrderEntity>;
  payments: Record<string, PaymentEntity>;
  processedEvents: string[];
}

const DEFAULT_STORAGE: StorageSchema = {
  users: {},
  profiles: {},
  events: {},
  preferences: {},
  wallets: {},
  ledger: {},
  entitlements: {},
  campaigns: {},
  coupons: {},
  redemptions: [],
  distributions: [],
  communicationDrafts: [],
  auditLogs: [],
  dailyCredits: {},
  notifications: {},
  journals: {},
  orders: {},
  payments: {},
  processedEvents: [],
};

export class DurableFilePersistenceAdapter implements IPersistenceAdapter {
  public readonly driver = 'file';
  public readonly isDurable = true;
  private filePath: string;
  private data: StorageSchema = JSON.parse(JSON.stringify(DEFAULT_STORAGE));
  private initialized = false;

  constructor(customPath?: string) {
    this.filePath =
      customPath ||
      process.env.PERSISTENCE_FILE_PATH ||
      path.resolve(process.cwd(), 'data', 'orbie_persistence.json');
  }

  public async init(): Promise<void> {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...DEFAULT_STORAGE,
          ...parsed,
          users: parsed.users || {},
          profiles: parsed.profiles || {},
          events: parsed.events || {},
          preferences: parsed.preferences || {},
          wallets: parsed.wallets || {},
          ledger: parsed.ledger || {},
          entitlements: parsed.entitlements || {},
          campaigns: parsed.campaigns || {},
          coupons: parsed.coupons || {},
          redemptions: parsed.redemptions || [],
          dailyCredits: parsed.dailyCredits || {},
          notifications: parsed.notifications || {},
          journals: parsed.journals || {},
          orders: parsed.orders || {},
          payments: parsed.payments || {},
          processedEvents: parsed.processedEvents || [],
        };
      } catch (err) {
        console.error(`[DurableFilePersistence] Error reading ${this.filePath}, creating clean file:`, err);
        this.saveToDisk();
      }
    } else {
      this.saveToDisk();
    }
    this.initialized = true;
  }

  public async close(): Promise<void> {
    this.saveToDisk();
    this.initialized = false;
  }

  public getStatus(): PersistenceStatus {
    return {
      driver: 'file',
      connected: this.initialized,
      isDurable: true,
      location: this.filePath,
      details: `Persistent store active at ${this.filePath}`,
    };
  }

  private saveToDisk(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${this.filePath}.tmp.${Date.now()}`;
    const serialized = JSON.stringify(this.data, null, 2);
    fs.writeFileSync(tempPath, serialized, 'utf-8');
    fs.renameSync(tempPath, this.filePath);
  }

  // --- REPOSITORIES ---

  public readonly users: IUserRepository = {
    get: async (uid: string) => {
      const user = this.data.users[uid];
      return user ? { ...user } : null;
    },
    save: async (user: UserEntity) => {
      this.data.users[user.uid] = { ...user };
      this.saveToDisk();
      return { ...user };
    },
    list: async () => {
      return Object.values(this.data.users).map((u) => ({ ...u }));
    },
    delete: async (uid: string) => {
      if (this.data.users[uid]) {
        delete this.data.users[uid];
        this.saveToDisk();
        return true;
      }
      return false;
    },
  };

  public readonly profiles: IProfileRepository = {
    get: async (id: string) => {
      const profile = this.data.profiles[id];
      return profile ? { ...profile } : null;
    },
    findByOwner: async (ownerUid: string) => {
      return Object.values(this.data.profiles)
        .filter((p) => p.ownerUid === ownerUid)
        .map((p) => ({ ...p }));
    },
    getPrimary: async (ownerUid: string) => {
      const primary = Object.values(this.data.profiles).find(
        (p) => p.ownerUid === ownerUid && p.isPrimary
      );
      return primary ? { ...primary } : null;
    },
    save: async (profile: ProfileEntity) => {
      this.data.profiles[profile.id] = { ...profile };
      this.saveToDisk();
      return { ...profile };
    },
    delete: async (id: string, ownerUid: string) => {
      const existing = this.data.profiles[id];
      if (existing && existing.ownerUid === ownerUid) {
        delete this.data.profiles[id];
        this.saveToDisk();
        return true;
      }
      return false;
    },
  };

  public readonly events: IEventRepository = {
    get: async (id: string) => {
      const event = this.data.events[id];
      return event ? { ...event } : null;
    },
    findByOwner: async (ownerUid: string) => {
      return Object.values(this.data.events)
        .filter((e) => e.ownerUid === ownerUid)
        .map((e) => ({ ...e }));
    },
    save: async (event: EventEntity) => {
      this.data.events[event.id] = { ...event };
      this.saveToDisk();
      return { ...event };
    },
    delete: async (id: string, ownerUid: string) => {
      const existing = this.data.events[id];
      if (existing && existing.ownerUid === ownerUid) {
        delete this.data.events[id];
        this.saveToDisk();
        return true;
      }
      return false;
    },
  };

  public readonly preferences: IPreferencesRepository = {
    get: async (ownerUid: string) => {
      const prefs = this.data.preferences[ownerUid];
      return prefs ? { ...prefs } : null;
    },
    save: async (prefs: PreferencesEntity) => {
      this.data.preferences[prefs.ownerUid] = { ...prefs };
      this.saveToDisk();
      return { ...prefs };
    },
  };

  public readonly wallets: IWalletRepository = {
    get: async (userUid: string) => {
      const wallet = this.data.wallets[userUid];
      return wallet ? { ...wallet } : null;
    },
    save: async (wallet: WalletEntity) => {
      this.data.wallets[wallet.userUid] = { ...wallet };
      this.saveToDisk();
      return { ...wallet };
    },
    getLedger: async (userUid: string) => {
      const entries = this.data.ledger[userUid] || [];
      return entries.map((e) => ({ ...e }));
    },
    addLedgerEntry: async (entry: LedgerEntryEntity) => {
      if (!this.data.ledger[entry.userUid]) {
        this.data.ledger[entry.userUid] = [];
      }
      this.data.ledger[entry.userUid].unshift({ ...entry });
      this.saveToDisk();
    },
    getEntitlements: async (userUid: string) => {
      const ents = this.data.entitlements[userUid] || [];
      return ents.map((e) => ({ ...e }));
    },
    addEntitlement: async (entitlement: EntitlementEntity) => {
      if (!this.data.entitlements[entitlement.userUid]) {
        this.data.entitlements[entitlement.userUid] = [];
      }
      this.data.entitlements[entitlement.userUid].push({ ...entitlement });
      this.saveToDisk();
    },
  };

  public readonly coupons: ICouponRepository = {
    getCampaign: async (id: string) => {
      const camp = this.data.campaigns[id];
      return camp ? { ...camp } : null;
    },
    listCampaigns: async () => {
      return Object.values(this.data.campaigns).map((c) => ({ ...c }));
    },
    saveCampaign: async (campaign: CampaignEntity) => {
      this.data.campaigns[campaign.id] = { ...campaign };
      this.saveToDisk();
    },
    deleteCampaign: async (id: string) => {
      if (this.data.campaigns[id]) {
        delete this.data.campaigns[id];
        this.saveToDisk();
        return true;
      }
      return false;
    },
    getCoupon: async (code: string) => {
      const coup = this.data.coupons[code.toUpperCase()];
      return coup ? { ...coup } : null;
    },
    getCouponByToken: async (token: string) => {
      const found = Object.values(this.data.coupons).find((c) => c.token === token || c.qrReference === token);
      return found ? { ...found } : null;
    },
    listCoupons: async () => {
      return Object.values(this.data.coupons).map((c) => ({ ...c }));
    },
    saveCoupon: async (coupon: CouponEntity) => {
      this.data.coupons[coupon.code.toUpperCase()] = { ...coupon };
      this.saveToDisk();
    },
    getRedemptionsByUser: async (userUid: string) => {
      return (this.data.redemptions || [])
        .filter((r) => r.userUid === userUid)
        .map((r) => ({ ...r }));
    },
    getAllRedemptions: async () => {
      return (this.data.redemptions || []).map((r) => ({ ...r }));
    },
    addRedemption: async (redemption: CouponRedemptionEntity) => {
      if (!this.data.redemptions) this.data.redemptions = [];
      this.data.redemptions.push({ ...redemption });
      this.saveToDisk();
    },
    listDistributions: async () => {
      return (this.data.distributions || []).map((d) => ({ ...d }));
    },
    saveDistribution: async (dist: DistributionEntity) => {
      if (!this.data.distributions) this.data.distributions = [];
      const idx = this.data.distributions.findIndex((d) => d.id === dist.id);
      if (idx >= 0) {
        this.data.distributions[idx] = { ...dist };
      } else {
        this.data.distributions.unshift({ ...dist });
      }
      this.saveToDisk();
    },
    listAuditLogs: async () => {
      return (this.data.auditLogs || []).map((l) => ({ ...l }));
    },
    addAuditLog: async (log: AdminAuditLogEntity) => {
      if (!this.data.auditLogs) this.data.auditLogs = [];
      this.data.auditLogs.unshift({ ...log });
      this.saveToDisk();
    },
  };

  public readonly dailyCredits: IDailyCreditRepository = {
    getState: async (userUid: string) => {
      const state = this.data.dailyCredits[userUid];
      return state ? { ...state } : null;
    },
    saveState: async (state: UserCheckInStateEntity) => {
      this.data.dailyCredits[state.userUid] = { ...state };
      this.saveToDisk();
    },
  };

  public readonly notifications: INotificationRepository = {
    findByOwner: async (ownerUid: string) => {
      const notifs = this.data.notifications[ownerUid] || [];
      return notifs.map((n) => ({ ...n }));
    },
    listAll: async () => {
      const all: NotificationEntity[] = [];
      for (const list of Object.values(this.data.notifications || {})) {
        all.push(...list);
      }
      return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    save: async (notification: NotificationEntity) => {
      if (!this.data.notifications[notification.ownerUid]) {
        this.data.notifications[notification.ownerUid] = [];
      }
      const existingIdx = this.data.notifications[notification.ownerUid].findIndex((n) => n.id === notification.id);
      if (existingIdx >= 0) {
        this.data.notifications[notification.ownerUid][existingIdx] = { ...notification };
      } else {
        this.data.notifications[notification.ownerUid].unshift({ ...notification });
      }
      this.saveToDisk();
    },
  };

  public readonly communications: ICommunicationRepository = {
    listDrafts: async () => {
      return (this.data.communicationDrafts || []).map((d) => ({ ...d }));
    },
    saveDraft: async (draft: CommunicationDraftEntity) => {
      if (!this.data.communicationDrafts) this.data.communicationDrafts = [];
      const idx = this.data.communicationDrafts.findIndex((d) => d.id === draft.id);
      if (idx >= 0) {
        this.data.communicationDrafts[idx] = { ...draft };
      } else {
        this.data.communicationDrafts.unshift({ ...draft });
      }
      this.saveToDisk();
    },
    getDraft: async (id: string) => {
      const draft = (this.data.communicationDrafts || []).find((d) => d.id === id);
      return draft ? { ...draft } : null;
    },
  };

  public readonly journals: IJournalRepository = {
    findByOwner: async (ownerUid: string) => {
      const entries = this.data.journals[ownerUid] || [];
      return entries.map((j) => ({ ...j }));
    },
    save: async (entry: JournalEntryEntity) => {
      if (!this.data.journals[entry.ownerUid]) {
        this.data.journals[entry.ownerUid] = [];
      }
      const list = this.data.journals[entry.ownerUid];
      const idx = list.findIndex((x) => x.id === entry.id);
      if (idx >= 0) {
        list[idx] = { ...entry };
      } else {
        list.unshift({ ...entry });
      }
      this.saveToDisk();
    },
  };

  public readonly commercial: ICommercialRepository = {
    getConfig: async () => {
      if (this.data.commercial) {
        return JSON.parse(JSON.stringify(this.data.commercial));
      }
      return null;
    },
    saveConfig: async (snapshot: CommercialStorageSnapshot) => {
      this.data.commercial = JSON.parse(JSON.stringify(snapshot));
      this.saveToDisk();
    },
  };

  public readonly orders: IOrderRepository = {
    get: async (orderId: string) => {
      const order = this.data.orders[orderId];
      return order ? { ...order } : null;
    },
    getByProviderReference: async (ref: string) => {
      const all = Object.values(this.data.orders);
      const match = all.find((o) => o.providerReference === ref || o.orderId === ref);
      return match ? { ...match } : null;
    },
    findByUser: async (userId: string) => {
      const all = Object.values(this.data.orders);
      return all.filter((o) => o.userId === userId).map((o) => ({ ...o }));
    },
    listAll: async () => {
      return Object.values(this.data.orders).map((o) => ({ ...o }));
    },
    save: async (order: OrderEntity) => {
      this.data.orders[order.orderId] = { ...order, updatedAt: new Date().toISOString() };
      this.saveToDisk();
      return { ...this.data.orders[order.orderId] };
    },
  };

  public readonly payments: IPaymentRepository = {
    get: async (paymentId: string) => {
      const payment = this.data.payments[paymentId];
      return payment ? { ...payment } : null;
    },
    getByProviderPaymentId: async (providerPaymentId: string) => {
      const all = Object.values(this.data.payments);
      const match = all.find((p) => p.providerPaymentId === providerPaymentId || p.paymentId === providerPaymentId);
      return match ? { ...match } : null;
    },
    findByOrder: async (orderId: string) => {
      const all = Object.values(this.data.payments);
      return all.filter((p) => p.orderId === orderId).map((p) => ({ ...p }));
    },
    save: async (payment: PaymentEntity) => {
      this.data.payments[payment.paymentId] = { ...payment, updatedAt: new Date().toISOString() };
      this.saveToDisk();
      return { ...this.data.payments[payment.paymentId] };
    },
    isEventProcessed: async (eventId: string) => {
      if (!this.data.processedEvents) this.data.processedEvents = [];
      return this.data.processedEvents.includes(eventId);
    },
    markEventProcessed: async (eventId: string) => {
      if (!this.data.processedEvents) this.data.processedEvents = [];
      if (!this.data.processedEvents.includes(eventId)) {
        this.data.processedEvents.push(eventId);
        this.saveToDisk();
      }
    },
  };
}

export { DurableFilePersistenceAdapter as FilePersistenceAdapter };
