/**
 * ORBIE — Persistence Layer Repository Interfaces
 * Decoupled, replaceable contracts for durable storage adapters.
 */

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
} from './types';

export interface IUserRepository {
  get(uid: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
  list(): Promise<UserEntity[]>;
  delete(uid: string): Promise<boolean>;
}

export interface IProfileRepository {
  get(id: string): Promise<ProfileEntity | null>;
  findByOwner(ownerUid: string): Promise<ProfileEntity[]>;
  getPrimary(ownerUid: string): Promise<ProfileEntity | null>;
  save(profile: ProfileEntity): Promise<ProfileEntity>;
  delete(id: string, ownerUid: string): Promise<boolean>;
}

export interface IEventRepository {
  get(id: string): Promise<EventEntity | null>;
  findByOwner(ownerUid: string): Promise<EventEntity[]>;
  save(event: EventEntity): Promise<EventEntity>;
  delete(id: string, ownerUid: string): Promise<boolean>;
}

export interface IPreferencesRepository {
  get(ownerUid: string): Promise<PreferencesEntity | null>;
  save(prefs: PreferencesEntity): Promise<PreferencesEntity>;
}

export interface IWalletRepository {
  get(userUid: string): Promise<WalletEntity | null>;
  save(wallet: WalletEntity): Promise<WalletEntity>;
  getLedger(userUid: string): Promise<LedgerEntryEntity[]>;
  addLedgerEntry(entry: LedgerEntryEntity): Promise<void>;
  getEntitlements(userUid: string): Promise<EntitlementEntity[]>;
  addEntitlement(entitlement: EntitlementEntity): Promise<void>;
}

export interface ICouponRepository {
  getCampaign(id: string): Promise<CampaignEntity | null>;
  listCampaigns(): Promise<CampaignEntity[]>;
  saveCampaign(campaign: CampaignEntity): Promise<void>;
  deleteCampaign?(id: string): Promise<boolean>;
  getCoupon(code: string): Promise<CouponEntity | null>;
  getCouponByToken?(token: string): Promise<CouponEntity | null>;
  listCoupons(): Promise<CouponEntity[]>;
  saveCoupon(coupon: CouponEntity): Promise<void>;
  getRedemptionsByUser(userUid: string): Promise<CouponRedemptionEntity[]>;
  getAllRedemptions(): Promise<CouponRedemptionEntity[]>;
  addRedemption(redemption: CouponRedemptionEntity): Promise<void>;
  listDistributions(): Promise<DistributionEntity[]>;
  saveDistribution(dist: DistributionEntity): Promise<void>;
  listAuditLogs?(): Promise<AdminAuditLogEntity[]>;
  addAuditLog?(log: AdminAuditLogEntity): Promise<void>;
}

export interface IDailyCreditRepository {
  getState(userUid: string): Promise<UserCheckInStateEntity | null>;
  saveState(state: UserCheckInStateEntity): Promise<void>;
}

export interface INotificationRepository {
  findByOwner(ownerUid: string): Promise<NotificationEntity[]>;
  listAll(): Promise<NotificationEntity[]>;
  save(notification: NotificationEntity): Promise<void>;
}

export interface ICommunicationRepository {
  listDrafts(): Promise<CommunicationDraftEntity[]>;
  saveDraft(draft: CommunicationDraftEntity): Promise<void>;
  getDraft(id: string): Promise<CommunicationDraftEntity | null>;
}

export interface IJournalRepository {
  findByOwner(ownerUid: string): Promise<JournalEntryEntity[]>;
  save(entry: JournalEntryEntity): Promise<void>;
}

export interface CommercialStorageSnapshot {
  products: any[];
  regions: any[];
  dailyCreditRule: any;
  plans: any[];
  versions: any[];
}

export interface ICommercialRepository {
  getConfig(): Promise<CommercialStorageSnapshot | null>;
  saveConfig(snapshot: CommercialStorageSnapshot): Promise<void>;
}

export interface IOrderRepository {
  get(orderId: string): Promise<OrderEntity | null>;
  getByProviderReference(ref: string): Promise<OrderEntity | null>;
  findByUser(userId: string): Promise<OrderEntity[]>;
  listAll(): Promise<OrderEntity[]>;
  save(order: OrderEntity): Promise<OrderEntity>;
}

export interface IPaymentRepository {
  get(paymentId: string): Promise<PaymentEntity | null>;
  getByProviderPaymentId(providerPaymentId: string): Promise<PaymentEntity | null>;
  findByOrder(orderId: string): Promise<PaymentEntity[]>;
  save(payment: PaymentEntity): Promise<PaymentEntity>;
  isEventProcessed(eventId: string): Promise<boolean>;
  markEventProcessed(eventId: string): Promise<void>;
}

export interface IPersistenceAdapter {
  readonly driver: 'file' | 'firestore' | 'memory';
  readonly isDurable: boolean;
  init(): Promise<void>;
  close(): Promise<void>;
  getStatus(): PersistenceStatus;

  readonly users: IUserRepository;
  readonly profiles: IProfileRepository;
  readonly events: IEventRepository;
  readonly preferences: IPreferencesRepository;
  readonly wallets: IWalletRepository;
  readonly coupons: ICouponRepository;
  readonly dailyCredits: IDailyCreditRepository;
  readonly notifications: INotificationRepository;
  readonly journals: IJournalRepository;
  readonly commercial: ICommercialRepository;
  readonly orders: IOrderRepository;
  readonly payments: IPaymentRepository;
}
