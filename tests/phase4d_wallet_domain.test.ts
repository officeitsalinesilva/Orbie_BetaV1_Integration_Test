/**
 * ORBIE — PHASE 4D TEST SUITE
 * Wallet Domain, Server-Authoritative Daily Credits, Streak Engine, and Ledger Integrity
 */

import { walletService } from '../server/domain/wallet/walletService';
import { dailyCreditService, getPeriodDate, getDayDifference } from '../server/domain/dailyCredits/dailyCreditService';
import { walletRepo, dailyCreditRepo } from '../server/persistence';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runTest(num: number, name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ num, name, passed: true });
    console.log(`✓ Test ${num}: ${name}`);
  } catch (err: any) {
    results.push({ num, name, passed: false, error: err.message });
    console.error(`✗ Test ${num}: ${name} - FAIL: ${err.message}`);
  }
}

async function main() {
  console.log('================================================================');
  console.log('ORBIE PHASE 4D — WALLET DOMAIN & DAILY CREDITS INTEGRITY TESTS');
  console.log('Zero-welcome, Server-Authoritative Streak, Atomic Ledger');
  console.log('================================================================\n');

  // Test 1: Zero Welcome Credits
  await runTest(1, 'New wallet defaults to balance 0 (no unearned welcome credits)', async () => {
    const testUid = `user-test-zero-${Date.now()}`;
    const wallet = walletService.getWallet(testUid);
    assert(wallet.balance === 0, `Expected balance 0, got ${wallet.balance}`);
    assert(wallet.userUid === testUid, 'Wallet userUid should match');
    assert(wallet.ownerUid === testUid, 'Wallet ownerUid should match');
    const ledger = walletService.getLedger(testUid);
    assert(ledger.length === 0, `Expected empty ledger, got ${ledger.length}`);
  });

  // Test 2: First Daily Claim (Day 1)
  await runTest(2, 'First daily claim awards exactly 5 base credits', async () => {
    const testUid = `user-claim-1-${Date.now()}`;
    const result = await dailyCreditService.claimDailyCredits(testUid, {
      customDate: '2026-09-01',
      timezone: 'America/Sao_Paulo',
    });

    assert(result.claimed === true, 'Claim should be approved');
    assert(result.baseCreditsGranted === 5, `Expected 5 base credits, got ${result.baseCreditsGranted}`);
    assert(result.streakBonusGranted === 0, `Expected 0 streak bonus on day 1, got ${result.streakBonusGranted}`);
    assert(result.totalGranted === 5, `Expected total 5 credits, got ${result.totalGranted}`);
    assert(result.newBalance === 5, `Expected new balance 5, got ${result.newBalance}`);
    assert(result.currentStreak === 1, `Expected streak 1, got ${result.currentStreak}`);
    assert(result.streakActive === false, 'Streak should not be active on day 1');

    const wallet = walletService.getWallet(testUid);
    assert(wallet.balance === 5, `Wallet balance should be 5, got ${wallet.balance}`);

    const ledger = walletService.getLedger(testUid);
    assert(ledger.length === 1, `Ledger should have 1 entry, got ${ledger.length}`);
    assert(ledger[0].amount === 5, `Ledger entry amount should be 5, got ${ledger[0].amount}`);
    assert(ledger[0].balanceBefore === 0, 'BalanceBefore should be 0');
    assert(ledger[0].balanceAfter === 5, 'BalanceAfter should be 5');
    assert(ledger[0].source === 'PLATFORM_DAILY', `Expected source PLATFORM_DAILY, got ${ledger[0].source}`);
  });

  // Test 3: Same Day Duplicate Claim Rejected
  await runTest(3, 'Duplicate claim on same period is strictly rejected (0 credits granted)', async () => {
    const testUid = `user-dup-claim-${Date.now()}`;
    // First claim
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-01' });
    
    // Duplicate attempt
    const secondResult = await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-01' });
    assert(secondResult.claimed === false, 'Second claim must be rejected');
    assert(secondResult.totalGranted === 0, `Expected 0 granted, got ${secondResult.totalGranted}`);
    assert(secondResult.newBalance === 5, `Balance must remain 5, got ${secondResult.newBalance}`);

    const wallet = walletService.getWallet(testUid);
    assert(wallet.balance === 5, `Wallet balance must remain 5, got ${wallet.balance}`);

    const ledger = walletService.getLedger(testUid);
    assert(ledger.length === 1, `Ledger must still have only 1 entry, got ${ledger.length}`);
  });

  // Test 4: Concurrency and Thread Safety with AsyncLock
  await runTest(4, '10 concurrent claims for the same period award credits exactly once', async () => {
    const testUid = `user-concurrent-${Date.now()}`;
    const promises = Array.from({ length: 10 }, (_, i) =>
      dailyCreditService.claimDailyCredits(testUid, {
        customDate: '2026-09-01',
        idempotencyKey: `req-${i}`,
      })
    );

    const outcomes = await Promise.all(promises);
    const successfulClaims = outcomes.filter((o) => o.claimed);
    const rejectedClaims = outcomes.filter((o) => !o.claimed);

    assert(successfulClaims.length === 1, `Expected exactly 1 success, got ${successfulClaims.length}`);
    assert(rejectedClaims.length === 9, `Expected 9 rejections, got ${rejectedClaims.length}`);

    const wallet = walletService.getWallet(testUid);
    assert(wallet.balance === 5, `Wallet balance must be exactly 5, got ${wallet.balance}`);

    const ledger = walletService.getLedger(testUid);
    assert(ledger.length === 1, `Ledger must contain exactly 1 entry, got ${ledger.length}`);
  });

  // Test 5: Streak Progression (Canonical: Day 1=5, Day 2=5, Day 3=10, Day 4=10)
  await runTest(5, 'Streak progression: Day 1 (5), Day 2 (5), Day 3 (10: 5+5), Day 4 (10: 5+5)', async () => {
    const testUid = `user-streak-${Date.now()}`;

    // Day 1
    const d1 = await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-01' });
    assert(d1.totalGranted === 5, `Day 1 total should be 5, got ${d1.totalGranted}`);
    assert(d1.currentStreak === 1, 'Day 1 streak should be 1');
    assert(d1.streakActive === false, 'Day 1 streakActive should be false');
    assert(d1.newBalance === 5, 'Day 1 balance should be 5');

    // Day 2
    const d2 = await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-02' });
    assert(d2.totalGranted === 5, `Day 2 total should be 5, got ${d2.totalGranted}`);
    assert(d2.currentStreak === 2, 'Day 2 streak should be 2');
    assert(d2.streakActive === false, 'Day 2 streakActive should be false');
    assert(d2.newBalance === 10, 'Day 2 balance should be 10');

    // Day 3 (Streak >= 3 activates +5 bonus)
    const d3 = await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-03' });
    assert(d3.baseCreditsGranted === 5, 'Day 3 base should be 5');
    assert(d3.streakBonusGranted === 5, `Day 3 streak bonus should be 5, got ${d3.streakBonusGranted}`);
    assert(d3.totalGranted === 10, `Day 3 total should be 10, got ${d3.totalGranted}`);
    assert(d3.currentStreak === 3, 'Day 3 streak should be 3');
    assert(d3.streakActive === true, 'Day 3 streakActive should be true');
    assert(d3.newBalance === 20, `Day 3 balance should be 20, got ${d3.newBalance}`);

    // Day 4 (Streak remains active, awards 10: 5 base + 5 streak)
    const d4 = await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-04' });
    assert(d4.totalGranted === 10, `Day 4 total should be 10, got ${d4.totalGranted}`);
    assert(d4.currentStreak === 4, 'Day 4 streak should be 4');
    assert(d4.streakActive === true, 'Day 4 streakActive should be true');
    assert(d4.newBalance === 30, `Day 4 balance should be 30, got ${d4.newBalance}`);

    const wallet = walletService.getWallet(testUid);
    assert(wallet.balance === 30, `Wallet balance should be 30, got ${wallet.balance}`);
  });

  // Test 6: Streak Break Reset
  await runTest(6, 'Skipping a day resets streak back to 1 and removes bonus', async () => {
    const testUid = `user-streak-break-${Date.now()}`;

    // Consecutive claims for 3 days
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-01' });
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-02' });
    const d3 = await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-03' });
    assert(d3.streakActive === true, 'Streak should be active on day 3');
    assert(d3.newBalance === 20, 'Balance after day 3 should be 20');

    // Skip Day 4 (2026-09-04) and claim on Day 5 (2026-09-05) -> gap = 2 days
    const d5 = await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-05' });
    assert(d5.currentStreak === 1, `Expected streak reset to 1, got ${d5.currentStreak}`);
    assert(d5.streakActive === false, 'Streak should not be active after break');
    assert(d5.baseCreditsGranted === 5, 'Base credits should be 5');
    assert(d5.streakBonusGranted === 0, 'Streak bonus should be 0 after reset');
    assert(d5.totalGranted === 5, 'Total granted should be 5');
    assert(d5.newBalance === 25, `New balance should be 25, got ${d5.newBalance}`);
  });

  // Test 7: Spending Validation and Ledger Atomicity
  await runTest(7, 'Spending checks balance, rejects overdrafts, and updates ledger atomically', async () => {
    const testUid = `user-spend-${Date.now()}`;
    // Grant 10 credits
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-01' });
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-02' });
    assert(walletService.getWallet(testUid).balance === 10, 'Initial balance should be 10');

    // Overdraft attempt (spend 15 when balance is 10)
    let threwOverdraft = false;
    try {
      walletService.spendCredits(testUid, 15, 'item-overdraft', 'Item caro');
    } catch (e: any) {
      threwOverdraft = true;
      assert(e.message.includes('Saldo insuficiente'), 'Expected Saldo insuficiente message');
    }
    assert(threwOverdraft, 'Should have thrown overdraft error');
    assert(walletService.getWallet(testUid).balance === 10, 'Balance must remain 10 after failed spend');

    // Invalid spend attempt (spend 0 or negative)
    let threwInvalid = false;
    try {
      walletService.spendCredits(testUid, 0, 'item-zero', 'Zero spend');
    } catch {
      threwInvalid = true;
    }
    assert(threwInvalid, 'Should reject non-positive spend amount');

    // Valid spend (spend 4 credits)
    const spendRes = walletService.spendCredits(testUid, 4, 'astrological-chart-deep', 'Mapa Astral Profundo', 'profile', 'prof-123');
    assert(spendRes.success === true, 'Spend must succeed');
    assert(spendRes.wallet.balance === 6, `Balance should be 6, got ${spendRes.wallet.balance}`);
    assert(spendRes.transaction.type === 'debit', 'Transaction type must be debit');
    assert(spendRes.transaction.amount === 4, 'Transaction amount must be 4');
    assert(spendRes.transaction.balanceBefore === 10, 'Transaction balanceBefore must be 10');
    assert(spendRes.transaction.balanceAfter === 6, 'Transaction balanceAfter must be 6');
  });

  // Test 8: Ledger Mathematical Consistency & Immutability Chain
  await runTest(8, 'Ledger mathematical audit chain is fully consistent and unbroken', async () => {
    const testUid = `user-audit-chain-${Date.now()}`;
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-01' }); // +5 -> 5
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-02' }); // +5 -> 10
    walletService.spendCredits(testUid, 3, 'synastry-item', 'Sinastria'); // -3 -> 7
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-03' }); // +5 base, +5 streak -> 17
    walletService.spendCredits(testUid, 7, 'neuro-soundscape', 'Neuroacústica'); // -7 -> 10

    const rawLedger = walletService.getLedger(testUid);
    assert(rawLedger.length >= 4, `Expected at least 4 transactions, got ${rawLedger.length}`);

    // Sort chronologically (oldest to newest) to verify chain of balances
    const chronologicalLedger = [...rawLedger].reverse();

    // Verify mathematical link of every entry
    for (let i = 0; i < chronologicalLedger.length; i++) {
      const entry = chronologicalLedger[i];
      assert(entry.ownerUid === testUid, `Entry ${i} ownerUid must match user`);
      assert(entry.userUid === testUid, `Entry ${i} userUid must match user`);
      assert(typeof entry.balanceBefore === 'number', `Entry ${i} must have numeric balanceBefore`);
      assert(typeof entry.balanceAfter === 'number', `Entry ${i} must have numeric balanceAfter`);
      
      const expectedDelta = entry.type === 'credit' ? entry.amount : -entry.amount;
      assert(
        entry.balanceBefore + expectedDelta === entry.balanceAfter,
        `Entry ${i} delta mismatch: ${entry.balanceBefore} + ${expectedDelta} !== ${entry.balanceAfter}`
      );

      if (i > 0) {
        assert(
          chronologicalLedger[i].balanceBefore === chronologicalLedger[i - 1].balanceAfter,
          `Ledger link broken at index ${i}: prev after ${chronologicalLedger[i - 1].balanceAfter} !== curr before ${chronologicalLedger[i].balanceBefore}`
        );
      }
    }

    const currentWallet = walletService.getWallet(testUid);
    assert(
      currentWallet.balance === chronologicalLedger[chronologicalLedger.length - 1].balanceAfter,
      'Final wallet balance must equal balanceAfter of last ledger entry'
    );
    assert(
      currentWallet.balance === rawLedger[0].balanceAfter,
      'Latest ledger entry balanceAfter must equal current wallet balance'
    );
  });

  // Test 9: Persistence Verification in Repositories
  await runTest(9, 'Wallet and DailyCredit states persist durably in repository layers', async () => {
    const testUid = `user-persist-${Date.now()}`;
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-01' });
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-02' });
    await dailyCreditService.claimDailyCredits(testUid, { customDate: '2026-09-03' });

    // Directly query repository
    const storedWallet = await walletRepo.get(testUid);
    assert(storedWallet !== null, 'Wallet must be present in walletRepo');
    assert(storedWallet!.balance === 20, `Stored wallet balance should be 20, got ${storedWallet!.balance}`);

    const storedState = await dailyCreditRepo.getState(testUid);
    assert(storedState !== null, 'Check-in state must be present in dailyCreditRepo');
    assert(storedState!.currentStreak === 3, `Stored streak should be 3, got ${storedState!.currentStreak}`);
    assert(storedState!.streakActive === true, 'Stored streakActive should be true');
    assert(storedState!.lastClaimPeriod === '2026-09-03', 'Stored lastClaimPeriod must be 2026-09-03');

    const storedLedger = await walletRepo.getLedger(testUid);
    assert(storedLedger.length >= 3, `Stored ledger entries should be >= 3, got ${storedLedger.length}`);
  });

  // Summary
  console.log('\n================================================================');
  console.log('TEST SUMMARY');
  console.log('================================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);

  if (failed > 0) {
    console.error('\nFAILED TESTS:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => console.error(` - Test ${r.num}: ${r.name} -> ${r.error}`));
    process.exit(1);
  } else {
    console.log('\nALL PHASE 4D WALLET DOMAIN TESTS PASSED SUCCESSFULLY! ✓');
  }
}

main().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
