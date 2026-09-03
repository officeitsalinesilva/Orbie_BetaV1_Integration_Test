import { walletService } from '../wallet/walletService';

export interface DailyCreditStatus {
  canClaimToday: boolean;
  baseCredits: number;
  streakBonusCredits: number;
  totalAvailableToday: number;
  currentStreakDays: number;
  lastClaimDate: string | null;
  lastCheckInDate: string | null;
}

interface UserCheckInState {
  userUid: string;
  currentStreakDays: number;
  lastCheckInDate: string | null; // YYYY-MM-DD
  lastClaimDate: string | null;   // YYYY-MM-DD
}

export class DailyCreditService {
  private userStates: Map<string, UserCheckInState> = new Map();

  private getTodayDateString(): string {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  private getYesterdayDateString(): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().split('T')[0];
  }

  private getUserState(userUid: string): UserCheckInState {
    let state = this.userStates.get(userUid);
    if (!state) {
      state = {
        userUid,
        currentStreakDays: 0,
        lastCheckInDate: null,
        lastClaimDate: null,
      };
      this.userStates.set(userUid, state);
    }
    return state;
  }

  /**
   * Returns current daily credit status and streak calculations
   */
  public getStatus(userUid: string): DailyCreditStatus {
    const state = this.getUserState(userUid);
    const today = this.getTodayDateString();
    const canClaimToday = state.lastClaimDate !== today;

    const baseCredits = 5;
    // Check-in rule: 3 consecutive days enables +5 additional daily credits (+5 credits/day while streak >= 3)
    const qualifiesForBonus = state.currentStreakDays >= 3;
    const streakBonusCredits = qualifiesForBonus ? 5 : 0;
    const totalAvailableToday = canClaimToday ? baseCredits + streakBonusCredits : 0;

    return {
      canClaimToday,
      baseCredits,
      streakBonusCredits,
      totalAvailableToday,
      currentStreakDays: state.currentStreakDays,
      lastClaimDate: state.lastClaimDate,
      lastCheckInDate: state.lastCheckInDate,
    };
  }

  /**
   * Record a check-in (e.g. from daily checkpoint or manual check-in)
   * Advances streak if yesterday, keeps streak if today, resets if missed > 1 day
   */
  public recordCheckIn(userUid: string, customDate?: string): { currentStreakDays: number; isBonusActive: boolean } {
    const state = this.getUserState(userUid);
    const checkDate = customDate || this.getTodayDateString();
    const yesterday = this.getYesterdayDateString();

    if (state.lastCheckInDate === checkDate) {
      // Already checked in today, keep streak
      return {
        currentStreakDays: state.currentStreakDays,
        isBonusActive: state.currentStreakDays >= 3,
      };
    }

    if (state.lastCheckInDate === yesterday) {
      state.currentStreakDays += 1;
    } else if (!state.lastCheckInDate) {
      state.currentStreakDays = 1;
    } else {
      // Check if distance between last checkin and checkDate is 1 day
      const last = new Date(state.lastCheckInDate);
      const curr = new Date(checkDate);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        state.currentStreakDays += 1;
      } else {
        // Missed one or more days, reset streak to 1
        state.currentStreakDays = 1;
      }
    }

    state.lastCheckInDate = checkDate;
    return {
      currentStreakDays: state.currentStreakDays,
      isBonusActive: state.currentStreakDays >= 3,
    };
  }

  /**
   * Claim daily credits (Base 5 + Streak bonus 5 if streak >= 3)
   * Server-authoritative: creates Ledger entries and updates Wallet
   */
  public claimDailyCredits(userUid: string, customDate?: string): {
    claimed: boolean;
    baseCreditsGranted: number;
    streakBonusGranted: number;
    totalGranted: number;
    newBalance: number;
    streakDays: number;
    message: string;
  } {
    const state = this.getUserState(userUid);
    const today = customDate || this.getTodayDateString();

    if (state.lastClaimDate === today) {
      const wallet = walletService.getWallet(userUid);
      return {
        claimed: false,
        baseCreditsGranted: 0,
        streakBonusGranted: 0,
        totalGranted: 0,
        newBalance: wallet.balance,
        streakDays: state.currentStreakDays,
        message: 'Créditos diários de hoje já foram resgatados.',
      };
    }

    // Auto record check-in for claiming today
    this.recordCheckIn(userUid, today);

    const baseCredits = 5;
    const qualifiesForBonus = state.currentStreakDays >= 3;
    const streakBonus = qualifiesForBonus ? 5 : 0;
    const total = baseCredits + streakBonus;

    // 1. Grant base daily credits
    walletService.grantCredits(
      userUid,
      baseCredits,
      'DAILY_BASE',
      `Créditos diários base (${today})`,
      today
    );

    // 2. Grant streak bonus if qualified
    if (streakBonus > 0) {
      walletService.grantCredits(
        userUid,
        streakBonus,
        'CHECKIN_STREAK_BONUS',
        `Bônus de check-in consecutivo (${state.currentStreakDays} dias seguidos)`,
        today
      );
    }

    state.lastClaimDate = today;
    const finalWallet = walletService.getWallet(userUid);

    return {
      claimed: true,
      baseCreditsGranted: baseCredits,
      streakBonusGranted: streakBonus,
      totalGranted: total,
      newBalance: finalWallet.balance,
      streakDays: state.currentStreakDays,
      message: qualifiesForBonus
        ? `Você recebeu 10 créditos (5 base + 5 bônus de ${state.currentStreakDays} dias de check-in)!`
        : `Você recebeu 5 créditos diários. Faça check-in por 3 dias seguidos para ganhar +5 créditos diários!`,
    };
  }

  public resetForTest(): void {
    this.userStates.clear();
  }
}

export const dailyCreditService = new DailyCreditService();
