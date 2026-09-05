/**
 * ORBIE — Google Cloud Firestore Persistence Adapter
 * Production cloud storage adapter with typed collections, owner isolation,
 * and explicit error signaling (no silent fallback to memory).
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
import fs from 'fs';
import path from 'path';

function loadFirebaseConfig(): { projectId?: string } {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch {}
  return {};
}

const firebaseConfig = loadFirebaseConfig();

// --- FIRESTORE VALUE CONVERTERS ---
function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) {
    return { nullValue: null };
  }
  if (typeof val === 'boolean') {
    return { booleanValue: val };
  }
  if (typeof val === 'number') {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === 'string') {
    return { stringValue: val };
  }
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) {
        fields[k] = toFirestoreValue(v);
      }
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function fromFirestoreValue(val: any): any {
  if (!val || typeof val !== 'object') return null;
  if ('nullValue' in val) return null;
  if ('booleanValue' in val) return val.booleanValue;
  if ('integerValue' in val) return parseInt(val.integerValue, 10);
  if ('doubleValue' in val) return val.doubleValue;
  if ('stringValue' in val) return val.stringValue;
  if ('arrayValue' in val) return (val.arrayValue.values || []).map(fromFirestoreValue);
  if ('mapValue' in val) {
    const res: Record<string, any> = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      res[k] = fromFirestoreValue(v);
    }
    return res;
  }
  return null;
}

function toFirestoreDoc(obj: Record<string, any>) {
  const fields: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      fields[k] = toFirestoreValue(v);
    }
  }
  return { fields };
}

function fromFirestoreDoc(doc: any): any {
  if (!doc || !doc.fields) return null;
  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    res[k] = fromFirestoreValue(v);
  }
  return res;
}

export class FirestoreUnavailableError extends Error {
  constructor(message: string, public readonly details?: string) {
    super(`[Firestore Unavailable] ${message}`);
    this.name = 'FirestoreUnavailableError';
  }
}

export class FirestorePersistenceAdapter implements IPersistenceAdapter {
  public readonly driver = 'firestore';
  public readonly isDurable = true;
  private projectId: string;
  private databaseId: string;
  private baseUrl: string;
  private initialized = false;

  constructor() {
    this.projectId =
      process.env.FIRESTORE_PROJECT_ID ||
      firebaseConfig.projectId ||
      '';
    this.databaseId = process.env.FIRESTORE_DATABASE_ID || '(default)';
    this.baseUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/documents`;
  }

  public async init(): Promise<void> {
    if (!this.projectId) {
      throw new FirestoreUnavailableError(
        'Missing Firestore project ID. Configure FIRESTORE_PROJECT_ID or verify firebase-applet-config.json.',
        'No project ID found in environment or config.'
      );
    }

    // Verify Firestore availability without creating silent fallbacks
    try {
      const res = await fetch(this.baseUrl, { method: 'GET' });
      if (!res.ok) {
        if (res.status === 404) {
          throw new FirestoreUnavailableError(
            `Firestore database '${this.databaseId}' is not provisioned in project '${this.projectId}'.`,
            'HTTP 404: Database does not exist yet. Please provision Cloud Firestore in the Google Cloud Console.'
          );
        }
        if (res.status === 403 || res.status === 401) {
          throw new FirestoreUnavailableError(
            `Access denied to Firestore in project '${this.projectId}'. Missing IAM credentials.`,
            'Ensure GOOGLE_APPLICATION_CREDENTIALS or server service account is authorized with roles/datastore.user.'
          );
        }
      }
      this.initialized = true;
    } catch (err: any) {
      if (err instanceof FirestoreUnavailableError) {
        throw err;
      }
      throw new FirestoreUnavailableError(
        `Failed to establish connection to Cloud Firestore: ${err.message}`,
        err.stack
      );
    }
  }

  public async close(): Promise<void> {
    this.initialized = false;
  }

  public getStatus(): PersistenceStatus {
    return {
      driver: 'firestore',
      connected: this.initialized,
      isDurable: true,
      location: `projects/${this.projectId}/databases/${this.databaseId}`,
      details: this.initialized
        ? 'Connected to Google Cloud Firestore'
        : 'Firestore configured but not yet verified',
    };
  }

  private assertReady() {
    if (!this.initialized) {
      throw new FirestoreUnavailableError(
        'Firestore persistence adapter is not initialized or database is unavailable.'
      );
    }
  }

  private docUrl(collection: string, docId: string): string {
    return `${this.baseUrl}/${collection}/${encodeURIComponent(docId)}`;
  }

  private async getDoc<T>(collection: string, id: string): Promise<T | null> {
    this.assertReady();
    try {
      const res = await fetch(this.docUrl(collection, id));
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`Firestore GET ${res.status}: ${res.statusText}`);
      const data = await res.json();
      return fromFirestoreDoc(data) as T;
    } catch (err: any) {
      if (err instanceof FirestoreUnavailableError) throw err;
      throw new Error(`Firestore read error on ${collection}/${id}: ${err.message}`);
    }
  }

  private async setDoc<T extends Record<string, any>>(collection: string, id: string, data: T): Promise<T> {
    this.assertReady();
    try {
      const body = JSON.stringify(toFirestoreDoc(data));
      const res = await fetch(this.docUrl(collection, id), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) throw new Error(`Firestore PATCH ${res.status}: ${res.statusText}`);
      return data;
    } catch (err: any) {
      if (err instanceof FirestoreUnavailableError) throw err;
      throw new Error(`Firestore write error on ${collection}/${id}: ${err.message}`);
    }
  }

  private async deleteDoc(collection: string, id: string): Promise<boolean> {
    this.assertReady();
    try {
      const res = await fetch(this.docUrl(collection, id), { method: 'DELETE' });
      return res.ok;
    } catch (err: any) {
      if (err instanceof FirestoreUnavailableError) throw err;
      throw new Error(`Firestore delete error on ${collection}/${id}: ${err.message}`);
    }
  }

  private async queryDocs<T>(collection: string, filterField?: string, filterValue?: any): Promise<T[]> {
    this.assertReady();
    try {
      if (!filterField) {
        const res = await fetch(`${this.baseUrl}/${collection}`);
        if (res.status === 404) return [];
        if (!res.ok) throw new Error(`Firestore LIST error: ${res.statusText}`);
        const json = await res.json();
        return (json.documents || []).map((d: any) => fromFirestoreDoc(d) as T);
      }

      const queryPayload = {
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: {
            fieldFilter: {
              field: { fieldPath: filterField },
              op: 'EQUAL',
              value: toFirestoreValue(filterValue),
            },
          },
        },
      };
      const queryUrl = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/${this.databaseId}/documents:runQuery`;
      const res = await fetch(queryUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryPayload),
      });
      if (!res.ok) throw new Error(`Firestore QUERY error: ${res.statusText}`);
      const results = await res.json();
      const items: T[] = [];
      for (const r of results) {
        if (r.document) {
          items.push(fromFirestoreDoc(r.document) as T);
        }
      }
      return items;
    } catch (err: any) {
      if (err instanceof FirestoreUnavailableError) throw err;
      throw new Error(`Firestore query error on ${collection}: ${err.message}`);
    }
  }

  // --- REPOSITORY IMPLEMENTATIONS ---

  public readonly users: IUserRepository = {
    get: async (uid: string) => this.getDoc<UserEntity>('users', uid),
    save: async (user: UserEntity) => this.setDoc<UserEntity>('users', user.uid, user),
    list: async () => this.queryDocs<UserEntity>('users'),
    delete: async (uid: string) => this.deleteDoc('users', uid),
  };

  public readonly profiles: IProfileRepository = {
    get: async (id: string) => this.getDoc<ProfileEntity>('profiles', id),
    findByOwner: async (ownerUid: string) => this.queryDocs<ProfileEntity>('profiles', 'ownerUid', ownerUid),
    getPrimary: async (ownerUid: string) => {
      const ownerProfiles = await this.queryDocs<ProfileEntity>('profiles', 'ownerUid', ownerUid);
      return ownerProfiles.find((p) => p.isPrimary) || null;
    },
    save: async (profile: ProfileEntity) => this.setDoc<ProfileEntity>('profiles', profile.id, profile),
    delete: async (id: string, ownerUid: string) => {
      const existing = await this.getDoc<ProfileEntity>('profiles', id);
      if (!existing || existing.ownerUid !== ownerUid) return false;
      return this.deleteDoc('profiles', id);
    },
  };

  public readonly events: IEventRepository = {
    get: async (id: string) => this.getDoc<EventEntity>('events', id),
    findByOwner: async (ownerUid: string) => this.queryDocs<EventEntity>('events', 'ownerUid', ownerUid),
    save: async (event: EventEntity) => this.setDoc<EventEntity>('events', event.id, event),
    delete: async (id: string, ownerUid: string) => {
      const existing = await this.getDoc<EventEntity>('events', id);
      if (!existing || existing.ownerUid !== ownerUid) return false;
      return this.deleteDoc('events', id);
    },
  };

  public readonly preferences: IPreferencesRepository = {
    get: async (ownerUid: string) => this.getDoc<PreferencesEntity>('user_preferences', ownerUid),
    save: async (prefs: PreferencesEntity) => this.setDoc<PreferencesEntity>('user_preferences', prefs.ownerUid, prefs),
  };

  public readonly wallets: IWalletRepository = {
    get: async (userUid: string) => this.getDoc<WalletEntity>('wallets', userUid),
    save: async (wallet: WalletEntity) => this.setDoc<WalletEntity>('wallets', wallet.userUid, wallet),
    getLedger: async (userUid: string) => {
      const entries = await this.queryDocs<LedgerEntryEntity>('ledger_entries', 'userUid', userUid);
      return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    addLedgerEntry: async (entry: LedgerEntryEntity) => {
      await this.setDoc<LedgerEntryEntity>('ledger_entries', entry.id, entry);
    },
    getEntitlements: async (userUid: string) => this.queryDocs<EntitlementEntity>('entitlements', 'userUid', userUid),
    addEntitlement: async (entitlement: EntitlementEntity) => {
      await this.setDoc<EntitlementEntity>('entitlements', entitlement.id, entitlement);
    },
  };

  public readonly coupons: ICouponRepository = {
    getCampaign: async (id: string) => this.getDoc<CampaignEntity>('coupon_campaigns', id),
    listCampaigns: async () => this.queryDocs<CampaignEntity>('coupon_campaigns'),
    saveCampaign: async (campaign: CampaignEntity) => {
      await this.setDoc<CampaignEntity>('coupon_campaigns', campaign.id, campaign);
    },
    deleteCampaign: async (id: string) => {
      return this.deleteDoc('coupon_campaigns', id);
    },
    getCoupon: async (code: string) => this.getDoc<CouponEntity>('coupons', code.toUpperCase()),
    getCouponByToken: async (token: string) => {
      const all = await this.queryDocs<CouponEntity>('coupons');
      return all.find((c) => c.token === token || c.qrReference === token) || null;
    },
    listCoupons: async () => this.queryDocs<CouponEntity>('coupons'),
    saveCoupon: async (coupon: CouponEntity) => {
      await this.setDoc<CouponEntity>('coupons', coupon.code.toUpperCase(), coupon);
    },
    getRedemptionsByUser: async (userUid: string) => this.queryDocs<CouponRedemptionEntity>('coupon_redemptions', 'userUid', userUid),
    getAllRedemptions: async () => this.queryDocs<CouponRedemptionEntity>('coupon_redemptions'),
    addRedemption: async (redemption: CouponRedemptionEntity) => {
      await this.setDoc<CouponRedemptionEntity>('coupon_redemptions', redemption.id, redemption);
    },
    listDistributions: async () => this.queryDocs<DistributionEntity>('coupon_distributions'),
    saveDistribution: async (dist: DistributionEntity) => {
      await this.setDoc<DistributionEntity>('coupon_distributions', dist.id, dist);
    },
    listAuditLogs: async () => this.queryDocs<AdminAuditLogEntity>('admin_audit_logs'),
    addAuditLog: async (log: AdminAuditLogEntity) => {
      await this.setDoc<AdminAuditLogEntity>('admin_audit_logs', log.id, log);
    },
  };

  public readonly dailyCredits: IDailyCreditRepository = {
    getState: async (userUid: string) => this.getDoc<UserCheckInStateEntity>('daily_checkin_states', userUid),
    saveState: async (state: UserCheckInStateEntity) => {
      await this.setDoc<UserCheckInStateEntity>('daily_checkin_states', state.userUid, state);
    },
  };

  public readonly notifications: INotificationRepository = {
    findByOwner: async (ownerUid: string) => this.queryDocs<NotificationEntity>('notifications', 'ownerUid', ownerUid),
    listAll: async () => this.queryDocs<NotificationEntity>('notifications'),
    save: async (notification: NotificationEntity) => {
      await this.setDoc<NotificationEntity>('notifications', notification.id, notification);
    },
  };

  public readonly journals: IJournalRepository = {
    findByOwner: async (ownerUid: string) => this.queryDocs<JournalEntryEntity>('journals', 'ownerUid', ownerUid),
    save: async (entry: JournalEntryEntity) => {
      await this.setDoc<JournalEntryEntity>('journals', entry.id, entry);
    },
  };

  public readonly commercial: ICommercialRepository = {
    getConfig: async () => {
      return this.getDoc<CommercialStorageSnapshot>('commercial_configs', 'current');
    },
    saveConfig: async (snapshot: CommercialStorageSnapshot) => {
      await this.setDoc<CommercialStorageSnapshot>('commercial_configs', 'current', snapshot);
    },
  };

  public readonly orders: IOrderRepository = {
    get: async (orderId: string) => this.getDoc<OrderEntity>('orders', orderId),
    getByProviderReference: async (ref: string) => {
      const list = await this.queryDocs<OrderEntity>('orders', 'providerReference', ref);
      if (list.length > 0) return list[0];
      return this.getDoc<OrderEntity>('orders', ref);
    },
    findByUser: async (userId: string) => this.queryDocs<OrderEntity>('orders', 'userId', userId),
    listAll: async () => this.queryDocs<OrderEntity>('orders'),
    save: async (order: OrderEntity) => {
      const updated = { ...order, updatedAt: new Date().toISOString() };
      await this.setDoc<OrderEntity>('orders', order.orderId, updated);
      return updated;
    },
  };

  public readonly payments: IPaymentRepository = {
    get: async (paymentId: string) => this.getDoc<PaymentEntity>('payments', paymentId),
    getByProviderPaymentId: async (providerPaymentId: string) => {
      const list = await this.queryDocs<PaymentEntity>('payments', 'providerPaymentId', providerPaymentId);
      if (list.length > 0) return list[0];
      return this.getDoc<PaymentEntity>('payments', providerPaymentId);
    },
    findByOrder: async (orderId: string) => this.queryDocs<PaymentEntity>('payments', 'orderId', orderId),
    save: async (payment: PaymentEntity) => {
      const updated = { ...payment, updatedAt: new Date().toISOString() };
      await this.setDoc<PaymentEntity>('payments', payment.paymentId, updated);
      return updated;
    },
    isEventProcessed: async (eventId: string) => {
      const doc = await this.getDoc<{ eventId: string }>('processed_webhook_events', eventId);
      return !!doc;
    },
    markEventProcessed: async (eventId: string) => {
      await this.setDoc('processed_webhook_events', eventId, { eventId, processedAt: new Date().toISOString() });
    },
  };
}
