import { Wallet, LedgerEntry, LedgerCategory, CreditSource, Entitlement } from './types';
import { walletRepo, getPersistenceAdapter } from '../../persistence';

export class AsyncLock {
  private queues = new Map<string, Promise<any>>();

  public async acquire<T>(key: string, fn: () => Promise<T> | T): Promise<T> {
    while (this.queues.has(key)) {
      try {
        await this.queues.get(key);
      } catch {}
    }

    let release: () => void;
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });

    this.queues.set(key, promise);

    try {
      return await fn();
    } finally {
      this.queues.delete(key);
      release!();
    }
  }
}

export class WalletService {
  private wallets: Map<string, Wallet> = new Map();
  private ledger: Map<string, LedgerEntry[]> = new Map();
  private entitlements: Map<string, Entitlement[]> = new Map();
  public readonly lock = new AsyncLock();

  /**
   * Get or initialize a user's wallet
   * Canonical Rule 8: New users start with 0 credits.
   */
  public getOrCreateWallet(userUid: string, initialBalance = 0, plan: 'free' | 'premium' = 'free'): Wallet {
    let wallet = this.wallets.get(userUid);
    if (!wallet) {
      // Check durable persistence layer
      try {
        const adapter = getPersistenceAdapter();
        if (adapter.driver === 'file') {
          const existingSync = (adapter as any).data?.wallets?.[userUid];
          if (existingSync) {
            wallet = {
              ownerUid: userUid,
              userUid,
              balance: existingSync.balance,
              plan: existingSync.plan || 'free',
              createdAt: existingSync.createdAt || existingSync.updatedAt || new Date().toISOString(),
              updatedAt: existingSync.updatedAt || new Date().toISOString(),
            };
            this.wallets.set(userUid, wallet);
            const existingLedger = (adapter as any).data?.ledger?.[userUid] || [];
            this.ledger.set(userUid, [...existingLedger]);
            const existingEnts = (adapter as any).data?.entitlements?.[userUid] || [];
            this.entitlements.set(userUid, [...existingEnts]);
            return wallet;
          }
        }
      } catch (err) {
        // Continue to create fresh wallet if not found
      }

      const now = new Date().toISOString();
      wallet = {
        ownerUid: userUid,
        userUid,
        balance: initialBalance,
        plan,
        createdAt: now,
        updatedAt: now,
      };
      this.wallets.set(userUid, wallet);
      void walletRepo.save(wallet as any);

      if (!this.ledger.has(userUid)) {
        if (initialBalance > 0) {
          const initialTx: LedgerEntry = {
            id: `tx-init-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ownerUid: userUid,
            userUid,
            amount: initialBalance,
            balanceBefore: 0,
            balanceAfter: initialBalance,
            type: 'CREDIT',
            category: 'INITIAL_ONBOARDING',
            source: 'WELCOME',
            description: 'Saldo inicial de créditos ORBIE',
            createdAt: now,
            timestamp: now,
          };
          this.ledger.set(userUid, [initialTx]);
          void walletRepo.addLedgerEntry(initialTx as any);
        } else {
          this.ledger.set(userUid, []);
        }
      }
      if (!this.entitlements.has(userUid)) {
        this.entitlements.set(userUid, []);
      }
    }
    return wallet;
  }

  public getWallet(userUid: string): Wallet {
    return this.getOrCreateWallet(userUid);
  }

  public getLedger(userUid: string): LedgerEntry[] {
    if (!this.ledger.has(userUid)) {
      try {
        const adapter = getPersistenceAdapter();
        if (adapter.driver === 'file') {
          const existing = (adapter as any).data?.ledger?.[userUid];
          if (existing) {
            this.ledger.set(userUid, [...existing]);
          }
        }
      } catch (err) {}
    }
    return this.ledger.get(userUid) || [];
  }

  public getEntitlements(userUid: string): Entitlement[] {
    if (!this.entitlements.has(userUid)) {
      try {
        const adapter = getPersistenceAdapter();
        if (adapter.driver === 'file') {
          const existing = (adapter as any).data?.entitlements?.[userUid];
          if (existing) {
            this.entitlements.set(userUid, [...existing]);
          }
        }
      } catch (err) {}
    }
    return this.entitlements.get(userUid) || [];
  }

  /**
   * Authoritative credit grant with immutable ledger record and source audit
   */
  public grantCredits(
    userUid: string,
    amount: number,
    category: LedgerCategory | string,
    description: string,
    referenceId?: string,
    options?: {
      source?: CreditSource;
      idempotencyKey?: string;
      metadata?: Record<string, any>;
    }
  ): { wallet: Wallet; entry: LedgerEntry } {
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) {
      throw new Error('Grant amount must be greater than zero');
    }

    const wallet = this.getOrCreateWallet(userUid);
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;
    const now = new Date().toISOString();

    wallet.balance = balanceAfter;
    wallet.updatedAt = now;

    const entry: LedgerEntry = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ownerUid: userUid,
      userUid,
      type: 'credit',
      category,
      source: options?.source || 'ADJUSTMENT',
      amount,
      balanceBefore,
      balanceAfter,
      referenceId,
      idempotencyKey: options?.idempotencyKey,
      description,
      metadata: options?.metadata,
      createdAt: now,
      timestamp: now,
    };

    const userEntries = this.ledger.get(userUid) || [];
    userEntries.unshift(entry);
    this.ledger.set(userUid, userEntries);

    void walletRepo.save(wallet as any);
    void walletRepo.addLedgerEntry(entry as any);

    return { wallet, entry };
  }

  /**
   * Authoritative credit consumption with server-side validation and immutable ledger
   */
  public spendCredits(
    userUid: string,
    amount: number,
    itemCode: string,
    description: string,
    scopeType: 'matrix' | 'profile' | 'event' = 'matrix',
    scopeId?: string
  ): { success: boolean; wallet: Wallet; entry: LedgerEntry; transaction: LedgerEntry; entitlement: Entitlement } {
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) {
      throw new Error('Spend amount must be greater than zero');
    }

    const wallet = this.getOrCreateWallet(userUid);
    if (wallet.balance < amount) {
      throw new Error(`Saldo insuficiente. Saldo atual: ${wallet.balance}, necessário: ${amount}`);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;
    const now = new Date().toISOString();

    wallet.balance = balanceAfter;
    wallet.updatedAt = now;

    const entry: LedgerEntry = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ownerUid: userUid,
      userUid,
      type: 'debit',
      category: 'ITEM_UNLOCK',
      source: 'PURCHASE',
      amount,
      balanceBefore,
      balanceAfter,
      referenceId: itemCode,
      description,
      createdAt: now,
      timestamp: now,
    };

    const userEntries = this.ledger.get(userUid) || [];
    userEntries.unshift(entry);
    this.ledger.set(userUid, userEntries);

    const entitlement: Entitlement = {
      id: `ent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ownerUid: userUid,
      userUid,
      scopeType,
      scopeId,
      itemCode,
      source: 'CREDIT_REDEMPTION',
      unlockedAt: now,
    };

    const userEntitlements = this.entitlements.get(userUid) || [];
    userEntitlements.push(entitlement);
    this.entitlements.set(userUid, userEntitlements);

    void walletRepo.save(wallet as any);
    void walletRepo.addLedgerEntry(entry as any);
    void walletRepo.addEntitlement(entitlement as any);

    return { success: true, wallet, entry, transaction: entry, entitlement };
  }

  public updatePlan(userUid: string, plan: 'free' | 'premium'): Wallet {
    const wallet = this.getOrCreateWallet(userUid);
    wallet.plan = plan;
    wallet.updatedAt = new Date().toISOString();
    void walletRepo.save(wallet as any);
    return wallet;
  }

  public resetForTest(): void {
    this.wallets.clear();
    this.ledger.clear();
    this.entitlements.clear();
  }
}

export const walletService = new WalletService();

