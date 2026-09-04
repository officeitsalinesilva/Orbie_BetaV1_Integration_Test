import { walletService, AsyncLock } from '../wallet/walletService';
import { dailyCreditRepo, profileRepo } from '../../persistence';

export interface DailyCreditStatus {
  canClaimToday: boolean;
  baseCredits: number;
  streakBonusCredits: number;
  totalAvailableToday: number;
  currentStreak: number;
  currentStreakDays: number; // compatibility alias
  streakActive: boolean;
  streakStartedAt: string | null;
  lastClaimAt: string | null;
  lastClaimPeriod: string | null;
  lastClaimDate: string | null; // compatibility alias
  lastCheckInDate?: string | null;
  periodDate: string;
  timezone: string;
}

export interface UserCheckInState {
  userUid: string;
  ownerUid: string;
  currentStreak: number;
  streakActive: boolean;
  lastClaimAt: string | null;
  lastClaimPeriod: string | null; // YYYY-MM-DD
  streakStartedAt: string | null;
  timezone: string;
  totalClaimedCredits: number;
  // Compatibility
  lastCheckInDate?: string | null;
  lastClaimDate?: string | null;
  streakDays?: number;
  totalClaimed?: number;
}

export interface DailyClaimResult {
  claimed: boolean;
  baseCreditsGranted: number;
  streakBonusGranted: number;
  totalGranted: number;
  newBalance: number;
  currentStreak: number;
  streakDays: number; // compatibility alias
  streakActive: boolean;
  periodDate: string;
  message: string;
}

/**
 * Deterministic calendar-day ISO date string (YYYY-MM-DD) for a given timezone.
 */
export function getPeriodDate(date: Date = new Date(), timezone: string = 'America/Sao_Paulo'): string {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(date);
  }
}

/**
 * Deterministic difference in calendar days between two YYYY-MM-DD strings.
 */
export function getDayDifference(period1: string, period2: string): number {
  const [y1, m1, d1] = period1.split('-').map(Number);
  const [y2, m2, d2] = period2.split('-').map(Number);
  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export class DailyCreditService {
  private userStates: Map<string, UserCheckInState> = new Map();
  private lock = new AsyncLock();

  public async getUserTimezone(userUid: string): Promise<string> {
    try {
      const primary = await profileRepo.getPrimary(userUid);
      if (primary && (primary.tz_str || (primary as any).timezone)) {
        return primary.tz_str || (primary as any).timezone;
      }
    } catch {}
    return 'America/Sao_Paulo';
  }

  public async getUserState(userUid: string): Promise<UserCheckInState> {
    let state = this.userStates.get(userUid);
    if (!state) {
      try {
        const persisted = await dailyCreditRepo.getState(userUid);
        if (persisted) {
          state = {
            userUid,
            ownerUid: persisted.ownerUid || userUid,
            currentStreak: persisted.currentStreak ?? persisted.streakDays ?? 0,
            streakActive: persisted.streakActive ?? (persisted.streakDays ? persisted.streakDays >= 3 : false),
            lastClaimAt: persisted.lastClaimAt ?? null,
            lastClaimPeriod: persisted.lastClaimPeriod ?? persisted.lastClaimDate ?? null,
            streakStartedAt: persisted.streakStartedAt ?? null,
            timezone: persisted.timezone || 'America/Sao_Paulo',
            totalClaimedCredits: persisted.totalClaimedCredits ?? persisted.totalClaimed ?? 0,
            lastClaimDate: persisted.lastClaimDate ?? persisted.lastClaimPeriod ?? null,
            streakDays: persisted.streakDays ?? persisted.currentStreak ?? 0,
            totalClaimed: persisted.totalClaimed ?? persisted.totalClaimedCredits ?? 0,
          };
          this.userStates.set(userUid, state);
          return state;
        }
      } catch {}

      state = {
        userUid,
        ownerUid: userUid,
        currentStreak: 0,
        streakActive: false,
        lastClaimAt: null,
        lastClaimPeriod: null,
        streakStartedAt: null,
        timezone: 'America/Sao_Paulo',
        totalClaimedCredits: 0,
        lastClaimDate: null,
        streakDays: 0,
        totalClaimed: 0,
      };
      this.userStates.set(userUid, state);
    }
    return state;
  }

  /**
   * Synchronous cached state getter for legacy calls
   */
  public getUserStateSync(userUid: string): UserCheckInState {
    let state = this.userStates.get(userUid);
    if (!state) {
      state = {
        userUid,
        ownerUid: userUid,
        currentStreak: 0,
        streakActive: false,
        lastClaimAt: null,
        lastClaimPeriod: null,
        streakStartedAt: null,
        timezone: 'America/Sao_Paulo',
        totalClaimedCredits: 0,
        lastClaimDate: null,
        streakDays: 0,
        totalClaimed: 0,
      };
      this.userStates.set(userUid, state);
    }
    return state;
  }

  /**
   * Returns current daily credit status and streak calculations
   */
  public async getStatus(
    userUid: string,
    options?: { timezone?: string; customDate?: string }
  ): Promise<DailyCreditStatus> {
    const timezone = options?.timezone || (await this.getUserTimezone(userUid));
    const periodDate = options?.customDate || getPeriodDate(new Date(), timezone);
    const state = await this.getUserState(userUid);

    const canClaimToday = state.lastClaimPeriod !== periodDate;

    // Determine what streak will be on next claim
    let nextStreak = 1;
    if (state.lastClaimPeriod) {
      const diff = getDayDifference(state.lastClaimPeriod, periodDate);
      if (diff === 0) {
        nextStreak = state.currentStreak;
      } else if (diff === 1) {
        nextStreak = state.currentStreak + 1;
      } else {
        nextStreak = 1;
      }
    }
    const nextStreakActive = nextStreak >= 3;
    const baseCredits = 5;
    const streakBonusCredits = nextStreakActive ? 5 : 0;
    const totalAvailableToday = canClaimToday ? baseCredits + streakBonusCredits : 0;

    return {
      canClaimToday,
      baseCredits,
      streakBonusCredits,
      totalAvailableToday,
      currentStreak: state.currentStreak,
      currentStreakDays: state.currentStreak,
      streakActive: state.streakActive,
      streakStartedAt: state.streakStartedAt,
      lastClaimAt: state.lastClaimAt,
      lastClaimPeriod: state.lastClaimPeriod,
      lastClaimDate: state.lastClaimPeriod,
      lastCheckInDate: state.lastCheckInDate,
      periodDate,
      timezone,
    };
  }

  /**
   * Sync getStatus for backwards compatibility
   */
  public getStatusSync(
    userUid: string,
    options?: { timezone?: string; customDate?: string }
  ): DailyCreditStatus {
    const timezone = options?.timezone || 'America/Sao_Paulo';
    const periodDate = options?.customDate || getPeriodDate(new Date(), timezone);
    const state = this.getUserStateSync(userUid);
    const canClaimToday = state.lastClaimPeriod !== periodDate;

    let nextStreak = 1;
    if (state.lastClaimPeriod) {
      const diff = getDayDifference(state.lastClaimPeriod, periodDate);
      if (diff === 0) nextStreak = state.currentStreak;
      else if (diff === 1) nextStreak = state.currentStreak + 1;
      else nextStreak = 1;
    }
    const nextStreakActive = nextStreak >= 3;
    const baseCredits = 5;
    const streakBonusCredits = nextStreakActive ? 5 : 0;
    const totalAvailableToday = canClaimToday ? baseCredits + streakBonusCredits : 0;

    return {
      canClaimToday,
      baseCredits,
      streakBonusCredits,
      totalAvailableToday,
      currentStreak: state.currentStreak,
      currentStreakDays: state.currentStreak,
      streakActive: state.streakActive,
      streakStartedAt: state.streakStartedAt,
      lastClaimAt: state.lastClaimAt,
      lastClaimPeriod: state.lastClaimPeriod,
      lastClaimDate: state.lastClaimPeriod,
      lastCheckInDate: state.lastCheckInDate,
      periodDate,
      timezone,
    };
  }

  /**
   * Record a check-in event (from checkpoint or manual check-in)
   */
  public async recordCheckIn(
    userUid: string,
    customDate?: string,
    timezone?: string
  ): Promise<{ currentStreakDays: number; isBonusActive: boolean }> {
    return this.lock.acquire(userUid, async () => {
      const tz = timezone || (await this.getUserTimezone(userUid));
      const checkDate = customDate || getPeriodDate(new Date(), tz);
      const state = await this.getUserState(userUid);

      if (state.lastCheckInDate === checkDate) {
        return {
          currentStreakDays: state.currentStreak,
          isBonusActive: state.streakActive,
        };
      }

      if (state.lastCheckInDate) {
        const diffDays = getDayDifference(state.lastCheckInDate, checkDate);
        if (diffDays === 1) {
          state.currentStreak += 1;
        } else if (diffDays > 1) {
          state.currentStreak = 1;
        }
      } else {
        state.currentStreak = 1;
      }

      state.streakActive = state.currentStreak >= 3;
      state.lastCheckInDate = checkDate;
      state.streakDays = state.currentStreak;
      this.userStates.set(userUid, state);
      await dailyCreditRepo.saveState(state as any);

      return {
        currentStreakDays: state.currentStreak,
        isBonusActive: state.streakActive,
      };
    });
  }

  /**
   * Claim daily credits (Server Authoritative)
   * Canonical Rule:
   * - Base: 5 credits/day
   * - Streak bonus: +5 credits/day when streak >= 3 consecutive days
   * - No future accumulation, no retroactive credits, no double claim on same period
   */
  public async claimDailyCredits(
    userUid: string,
    options?: {
      timezone?: string;
      customDate?: string;
      idempotencyKey?: string;
    }
  ): Promise<DailyClaimResult> {
    return this.lock.acquire(userUid, async () => {
      const timezone = options?.timezone || (await this.getUserTimezone(userUid));
      const periodDate = options?.customDate || getPeriodDate(new Date(), timezone);
      const state = await this.getUserState(userUid);

      // Check for same-day duplicate claim
      if (state.lastClaimPeriod === periodDate) {
        const wallet = walletService.getWallet(userUid);
        return {
          claimed: false,
          baseCreditsGranted: 0,
          streakBonusGranted: 0,
          totalGranted: 0,
          newBalance: wallet.balance,
          currentStreak: state.currentStreak,
          streakDays: state.currentStreak,
          streakActive: state.streakActive,
          periodDate,
          message: 'Créditos diários de hoje já foram resgatados.',
        };
      }

      const nowISO = new Date().toISOString();
      let currentStreak = 1;
      let streakStartedAt = state.streakStartedAt || nowISO;

      if (state.lastClaimPeriod) {
        const diff = getDayDifference(state.lastClaimPeriod, periodDate);
        if (diff === 1) {
          // Exactly consecutive day: streak increments
          currentStreak = state.currentStreak + 1;
        } else if (diff > 1) {
          // Gap of 1 or more missed days: streak broken and resets to 1
          currentStreak = 1;
          streakStartedAt = nowISO;
        } else if (diff <= 0) {
          // Same period (already handled) or clock skew/past date
          const wallet = walletService.getWallet(userUid);
          return {
            claimed: false,
            baseCreditsGranted: 0,
            streakBonusGranted: 0,
            totalGranted: 0,
            newBalance: wallet.balance,
            currentStreak: state.currentStreak,
            streakDays: state.currentStreak,
            streakActive: state.streakActive,
            periodDate,
            message: 'Período já resgatado ou data inconsistente.',
          };
        }
      } else {
        // First claim ever
        currentStreak = 1;
        streakStartedAt = nowISO;
      }

      const streakActive = currentStreak >= 3;
      const baseCredits = 5;
      const streakBonus = streakActive ? 5 : 0;
      const totalCredits = baseCredits + streakBonus;

      // 1. Authoritative grant of base daily credits
      walletService.grantCredits(
        userUid,
        baseCredits,
        'DAILY_BASE',
        `Crédito diário da plataforma (${periodDate})`,
        `claim-${periodDate}-base`,
        {
          source: 'PLATFORM_DAILY',
          idempotencyKey: options?.idempotencyKey ? `${options.idempotencyKey}-base` : undefined,
          metadata: { periodDate, timezone, type: 'base' },
        }
      );

      // 2. Authoritative grant of streak bonus if active (streak >= 3)
      if (streakBonus > 0) {
        walletService.grantCredits(
          userUid,
          streakBonus,
          'CHECKIN_STREAK_BONUS',
          `Bônus de streak (${currentStreak} dias consecutivos: +${streakBonus} ◎)`,
          `claim-${periodDate}-streak`,
          {
            source: 'STREAK',
            idempotencyKey: options?.idempotencyKey ? `${options.idempotencyKey}-streak` : undefined,
            metadata: { periodDate, timezone, currentStreak, type: 'streak' },
          }
        );
      }

      // Update state
      state.currentStreak = currentStreak;
      state.streakActive = streakActive;
      state.lastClaimAt = nowISO;
      state.lastClaimPeriod = periodDate;
      state.streakStartedAt = streakStartedAt;
      state.timezone = timezone;
      state.totalClaimedCredits = (state.totalClaimedCredits || 0) + totalCredits;
      // Compatibility fields
      state.lastClaimDate = periodDate;
      state.streakDays = currentStreak;
      state.totalClaimed = state.totalClaimedCredits;

      this.userStates.set(userUid, state);
      await dailyCreditRepo.saveState(state as any);

      const finalWallet = walletService.getWallet(userUid);

      return {
        claimed: true,
        baseCreditsGranted: baseCredits,
        streakBonusGranted: streakBonus,
        totalGranted: totalCredits,
        newBalance: finalWallet.balance,
        currentStreak,
        streakDays: currentStreak,
        streakActive,
        periodDate,
        message: streakActive
          ? `Você recebeu 10 créditos (5 base + 5 bônus por ${currentStreak} dias de check-in)!`
          : `Você recebeu 5 créditos diários. Mantenha 3 dias consecutivos para ativar +5 créditos diários!`,
      };
    });
  }

  public resetForTest(): void {
    this.userStates.clear();
  }
}

export const dailyCreditService = new DailyCreditService();
