/**
 * ORBIE — Persistence Layer Factory & Registry
 * Authoritative single point of truth for durable domain repositories.
 */

import { IPersistenceAdapter } from './interfaces';
import { DurableFilePersistenceAdapter } from './adapters/fileAdapter';
import { FirestorePersistenceAdapter, FirestoreUnavailableError } from './adapters/firestoreAdapter';
import { MemoryPersistenceAdapter } from './adapters/memoryAdapter';
import { CampaignEntity, CouponEntity } from './types';

let currentAdapter: IPersistenceAdapter | null = null;

export async function initPersistenceAdapter(): Promise<IPersistenceAdapter> {
  if (currentAdapter) {
    return currentAdapter;
  }

  const driver = process.env.PERSISTENCE_DRIVER || 'file';

  if (driver === 'firestore') {
    const firestore = new FirestorePersistenceAdapter();
    await firestore.init();
    currentAdapter = firestore;
  } else if (driver === 'memory') {
    const memory = new MemoryPersistenceAdapter();
    await memory.init();
    currentAdapter = memory;
  } else {
    // Default: Durable File-backed Persistence (survives restart)
    const file = new DurableFilePersistenceAdapter();
    await file.init();
    currentAdapter = file;
  }

  return currentAdapter;
}

export function getPersistenceAdapter(): IPersistenceAdapter {
  if (!currentAdapter) {
    // Synchronous fallback init for file adapter
    const file = new DurableFilePersistenceAdapter();
    void file.init();
    currentAdapter = file;
  }
  return currentAdapter;
}

export function setPersistenceAdapterForTesting(adapter: IPersistenceAdapter | null): void {
  currentAdapter = adapter;
}

// Export repository proxies that delegate to currentAdapter
export const userRepo = {
  get: async (uid: string) => (await getPersistenceAdapter()).users.get(uid),
  save: async (u: any) => (await getPersistenceAdapter()).users.save(u),
  list: async () => (await getPersistenceAdapter()).users.list(),
  delete: async (uid: string) => (await getPersistenceAdapter()).users.delete(uid),
};

export const profileRepo = {
  get: async (id: string) => (await getPersistenceAdapter()).profiles.get(id),
  findByOwner: async (ownerUid: string) => (await getPersistenceAdapter()).profiles.findByOwner(ownerUid),
  getPrimary: async (ownerUid: string) => (await getPersistenceAdapter()).profiles.getPrimary(ownerUid),
  save: async (p: any) => (await getPersistenceAdapter()).profiles.save(p),
  delete: async (id: string, ownerUid: string) => (await getPersistenceAdapter()).profiles.delete(id, ownerUid),
};

export const eventRepo = {
  get: async (id: string) => (await getPersistenceAdapter()).events.get(id),
  findByOwner: async (ownerUid: string) => (await getPersistenceAdapter()).events.findByOwner(ownerUid),
  save: async (e: any) => (await getPersistenceAdapter()).events.save(e),
  delete: async (id: string, ownerUid: string) => (await getPersistenceAdapter()).events.delete(id, ownerUid),
};

export const preferencesRepo = {
  get: async (ownerUid: string) => (await getPersistenceAdapter()).preferences.get(ownerUid),
  save: async (p: any) => (await getPersistenceAdapter()).preferences.save(p),
};

export const walletRepo = {
  get: async (userUid: string) => (await getPersistenceAdapter()).wallets.get(userUid),
  save: async (w: any) => (await getPersistenceAdapter()).wallets.save(w),
  getLedger: async (userUid: string) => (await getPersistenceAdapter()).wallets.getLedger(userUid),
  addLedgerEntry: async (e: any) => (await getPersistenceAdapter()).wallets.addLedgerEntry(e),
  getEntitlements: async (userUid: string) => (await getPersistenceAdapter()).wallets.getEntitlements(userUid),
  addEntitlement: async (e: any) => (await getPersistenceAdapter()).wallets.addEntitlement(e),
};

export const couponRepo = {
  getCampaign: async (id: string) => (await getPersistenceAdapter()).coupons.getCampaign(id),
  listCampaigns: async () => (await getPersistenceAdapter()).coupons.listCampaigns(),
  saveCampaign: async (c: any) => (await getPersistenceAdapter()).coupons.saveCampaign(c),
  deleteCampaign: async (id: string) => (await getPersistenceAdapter()).coupons.deleteCampaign?.(id),
  getCoupon: async (code: string) => (await getPersistenceAdapter()).coupons.getCoupon(code),
  getCouponByToken: async (token: string) => (await getPersistenceAdapter()).coupons.getCouponByToken?.(token),
  listCoupons: async () => (await getPersistenceAdapter()).coupons.listCoupons(),
  saveCoupon: async (c: any) => (await getPersistenceAdapter()).coupons.saveCoupon(c),
  getRedemptionsByUser: async (userUid: string) => (await getPersistenceAdapter()).coupons.getRedemptionsByUser(userUid),
  getAllRedemptions: async () => (await getPersistenceAdapter()).coupons.getAllRedemptions(),
  addRedemption: async (r: any) => (await getPersistenceAdapter()).coupons.addRedemption(r),
  listDistributions: async () => (await getPersistenceAdapter()).coupons.listDistributions(),
  saveDistribution: async (d: any) => (await getPersistenceAdapter()).coupons.saveDistribution(d),
  listAuditLogs: async () => (await getPersistenceAdapter()).coupons.listAuditLogs?.() || [],
  addAuditLog: async (l: any) => (await getPersistenceAdapter()).coupons.addAuditLog?.(l),
};

export const dailyCreditRepo = {
  getState: async (userUid: string) => (await getPersistenceAdapter()).dailyCredits.getState(userUid),
  saveState: async (s: any) => (await getPersistenceAdapter()).dailyCredits.saveState(s),
};

export const notificationRepo = {
  findByOwner: async (ownerUid: string) => (await getPersistenceAdapter()).notifications.findByOwner(ownerUid),
  listAll: async () => (await getPersistenceAdapter()).notifications.listAll(),
  save: async (n: any) => (await getPersistenceAdapter()).notifications.save(n),
};

export const communicationRepo = {
  listDrafts: async () => {
    const adapter = await getPersistenceAdapter();
    return (adapter as any).communications?.listDrafts?.() || [];
  },
  saveDraft: async (draft: any) => {
    const adapter = await getPersistenceAdapter();
    return (adapter as any).communications?.saveDraft?.(draft);
  },
  getDraft: async (id: string) => {
    const adapter = await getPersistenceAdapter();
    return (adapter as any).communications?.getDraft?.(id) || null;
  },
};

export const journalRepo = {
  findByOwner: async (ownerUid: string) => (await getPersistenceAdapter()).journals.findByOwner(ownerUid),
  save: async (j: any) => (await getPersistenceAdapter()).journals.save(j),
};

export {
  DurableFilePersistenceAdapter,
  FirestorePersistenceAdapter,
  MemoryPersistenceAdapter,
  FirestoreUnavailableError,
};
export * from './types';
export * from './interfaces';
