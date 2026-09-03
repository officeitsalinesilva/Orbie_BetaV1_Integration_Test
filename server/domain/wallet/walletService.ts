import { Wallet, LedgerEntry, LedgerCategory, Entitlement } from './types';

export class WalletService {
  private wallets: Map<string, Wallet> = new Map();
  private ledger: Map<string, LedgerEntry[]> = new Map();
  private entitlements: Map<string, Entitlement[]> = new Map();

  /**
   * Get or initialize a user's wallet
   * Brand new accounts start with 0 credits until granted daily base / coupon / purchase
   */
  public getOrCreateWallet(userUid: string, initialBalance = 10, plan: 'free' | 'premium' = 'free'): Wallet {
    let wallet = this.wallets.get(userUid);
    if (!wallet) {
      const now = new Date().toISOString();
      wallet = {
        userUid,
        balance: initialBalance,
        plan,
        createdAt: now,
        updatedAt: now,
      };
      this.wallets.set(userUid, wallet);
      if (!this.ledger.has(userUid)) {
        const welcomeTx: LedgerEntry = {
          id: `tx-init-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userUid,
          amount: initialBalance,
          balanceAfter: initialBalance,
          type: 'CREDIT',
          category: 'INITIAL_ONBOARDING',
          description: 'Créditos iniciais de boas-vindas ORBIE',
          timestamp: now,
        };
        this.ledger.set(userUid, [welcomeTx]);
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
    return this.ledger.get(userUid) || [];
  }

  public getEntitlements(userUid: string): Entitlement[] {
    return this.entitlements.get(userUid) || [];
  }

  /**
   * Authoritative credit grant with immutable ledger record
   */
  public grantCredits(
    userUid: string,
    amount: number,
    category: LedgerCategory,
    description: string,
    referenceId?: string
  ): { wallet: Wallet; entry: LedgerEntry } {
    if (amount <= 0) {
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
      userUid,
      type: 'CREDIT_GRANT',
      category,
      amount,
      balanceBefore,
      balanceAfter,
      referenceId,
      description,
      createdAt: now,
      timestamp: now,
    };

    const userEntries = this.ledger.get(userUid) || [];
    userEntries.unshift(entry);
    this.ledger.set(userUid, userEntries);

    return { wallet, entry };
  }

  /**
   * Authoritative credit consumption with immutable ledger record
   */
  public spendCredits(
    userUid: string,
    amount: number,
    itemCode: string,
    description: string,
    scopeType: 'matrix' | 'profile' | 'event' = 'matrix',
    scopeId?: string
  ): { wallet: Wallet; entry: LedgerEntry; entitlement: Entitlement } {
    if (amount <= 0) {
      throw new Error('Spend amount must be greater than zero');
    }

    const wallet = this.getOrCreateWallet(userUid);
    if (wallet.balance < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${wallet.balance}`);
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - amount;
    const now = new Date().toISOString();

    wallet.balance = balanceAfter;
    wallet.updatedAt = now;

    const entry: LedgerEntry = {
      id: `ledg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userUid,
      type: 'CREDIT_CONSUMPTION',
      category: 'ITEM_UNLOCK',
      amount: -amount,
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

    return { wallet, entry, entitlement };
  }

  public updatePlan(userUid: string, plan: 'free' | 'premium'): Wallet {
    const wallet = this.getOrCreateWallet(userUid);
    wallet.plan = plan;
    wallet.updatedAt = new Date().toISOString();
    return wallet;
  }

  public resetForTest(): void {
    this.wallets.clear();
    this.ledger.clear();
    this.entitlements.clear();
  }
}

export const walletService = new WalletService();
