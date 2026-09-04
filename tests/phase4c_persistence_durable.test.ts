/**
 * ORBIE — PHASE 4C TEST SUITE
 * Durable Persistence Layer, Repository Architecture, and Account Domain Validation
 */

import path from 'path';
import fs from 'fs';
import { FilePersistenceAdapter } from '../server/persistence/adapters/fileAdapter';
import { MemoryPersistenceAdapter } from '../server/persistence/adapters/memoryAdapter';
import {
  FirestorePersistenceAdapter,
  FirestoreUnavailableError,
} from '../server/persistence/adapters/firestoreAdapter';
import {
  UserEntity,
  ProfileEntity,
  EventEntity,
  WalletEntity,
  LedgerEntryEntity,
  CampaignEntity,
  CouponEntity,
} from '../server/persistence/types';

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
  console.log('====================================================');
  console.log('ORBIE PHASE 4C — PERSISTENCE & ACCOUNT DOMAIN TESTS');
  console.log('Durable Repositories, Disk Persistence & Firestore');
  console.log('====================================================\n');

  const testDataDir = path.resolve(process.cwd(), '.test_storage_data');

  // Clean up any test dir before starting
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }

  const fileAdapter = new FilePersistenceAdapter(testDataDir);
  await fileAdapter.init();

  // Test 1: User entity saving and retrieval in FileAdapter
  await runTest(1, 'User entity creation and persistence in FileAdapter', async () => {
    const user: UserEntity = {
      uid: 'user_4c_alpha',
      email: 'alpha@orbie.test',
      displayName: 'Alpha Test User',
      photoURL: 'https://example.com/alpha.jpg',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      accountStatus: 'onboarding_required',
      roles: ['user'],
    };

    await fileAdapter.users.save(user);
    const retrieved = await fileAdapter.users.get('user_4c_alpha');
    assert(retrieved !== null, 'User could not be retrieved from fileAdapter');
    assert(retrieved!.email === 'alpha@orbie.test', 'User email mismatch');
    assert(retrieved!.accountStatus === 'onboarding_required', 'Initial accountStatus mismatch');
  });

  // Test 2: Profile entity saving, primary profile query and owner isolation
  await runTest(2, 'Profile entity persistence and primary lookup', async () => {
    const profileA: ProfileEntity = {
      id: 'prof_alpha_primary',
      ownerUid: 'user_4c_alpha',
      fullName: 'Alpha User Primary',
      preferredName: 'Alpha',
      birthDay: '15',
      birthMonth: '06',
      birthYear: '1990',
      birthHour: '14',
      birthMinute: '30',
      birthCity: 'Curitiba',
      birthState: 'PR',
      birthCountry: 'Brasil',
      latitude: -25.4284,
      longitude: -49.2733,
      tz_str: 'America/Sao_Paulo',
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fileAdapter.profiles.save(profileA);
    const primary = await fileAdapter.profiles.getPrimary('user_4c_alpha');
    assert(primary !== null, 'Primary profile not found');
    assert(primary!.id === 'prof_alpha_primary', 'Primary profile ID mismatch');
    assert(primary!.latitude === -25.4284, 'Coordinates corrupted');
  });

  // Test 3: Owner isolation between User A and User B
  await runTest(3, 'Owner isolation prevents cross-user data leakage', async () => {
    const profileB: ProfileEntity = {
      id: 'prof_beta_primary',
      ownerUid: 'user_4c_beta',
      fullName: 'Beta User',
      preferredName: 'Beta',
      birthDay: '01',
      birthMonth: '01',
      birthYear: '1992',
      birthCity: 'Recife',
      birthCountry: 'Brasil',
      latitude: -8.0476,
      longitude: -34.877,
      tz_str: 'America/Recife',
      isPrimary: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await fileAdapter.profiles.save(profileB);

    // Query profiles for user A
    const userAProfiles = await fileAdapter.profiles.findByOwner('user_4c_alpha');
    assert(userAProfiles.length === 1, `Expected 1 profile for user A, got ${userAProfiles.length}`);
    assert(userAProfiles[0].id === 'prof_alpha_primary', 'User A received User B profile');

    // User A cannot delete User B's profile
    const deleted = await fileAdapter.profiles.delete('prof_beta_primary', 'user_4c_alpha');
    assert(deleted === false, 'User A was able to delete User B profile');

    const betaStillExists = await fileAdapter.profiles.get('prof_beta_primary');
    assert(betaStillExists !== null, 'User B profile was deleted illegally');
  });

  // Test 4: Wallet and immutable Ledger persistence
  await runTest(4, 'Wallet balance and immutable ledger tracking', async () => {
    const wallet: WalletEntity = {
      userUid: 'user_4c_alpha',
      balance: 50,
      totalPurchased: 50,
      totalSpent: 0,
      plan: 'free',
      updatedAt: new Date().toISOString(),
    };

    await fileAdapter.wallets.save(wallet);

    const ledger1: LedgerEntryEntity = {
      id: 'ledg_1',
      userUid: 'user_4c_alpha',
      amount: 50,
      balanceAfter: 50,
      reason: 'welcome_bonus',
      timestamp: new Date().toISOString(),
    };

    const ledger2: LedgerEntryEntity = {
      id: 'ledg_2',
      userUid: 'user_4c_alpha',
      amount: -10,
      balanceAfter: 40,
      reason: 'synthesis_generation',
      timestamp: new Date(Date.now() + 1000).toISOString(),
    };

    await fileAdapter.wallets.addLedgerEntry(ledger1);
    await fileAdapter.wallets.addLedgerEntry(ledger2);

    const entries = await fileAdapter.wallets.getLedger('user_4c_alpha');
    assert(entries.length === 2, `Expected 2 ledger entries, got ${entries.length}`);
    assert(entries[0].id === 'ledg_2', 'Expected newest ledger entry first');
  });

  // Test 5: Coupon campaign and coupon validation persistence
  await runTest(5, 'Coupon campaign and single/multiple redemption tracking', async () => {
    const campaign: CampaignEntity = {
      id: 'camp_launch',
      name: 'Launch Campaign',
      creditsGranted: 20,
      maxRedemptionsPerUser: 1,
      maxTotalRedemptions: 100,
      totalRedemptions: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await fileAdapter.coupons.saveCampaign(campaign);

    const coupon: CouponEntity = {
      code: 'ORB2026',
      campaignId: 'camp_launch',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    await fileAdapter.coupons.saveCoupon(coupon);

    const fetchedCoupon = await fileAdapter.coupons.getCoupon('ORB2026');
    assert(fetchedCoupon !== null, 'Coupon not found');
    assert(fetchedCoupon!.campaignId === 'camp_launch', 'Campaign ID mismatch');

    // Case-insensitivity check
    const fetchedLower = await fileAdapter.coupons.getCoupon('orb2026');
    assert(fetchedLower !== null, 'Coupon case-insensitive lookup failed');
  });

  // Test 6: DURABLE RECOVERY — Complete reload from disk in a fresh adapter instance
  await runTest(6, 'Full data recovery across independent server/adapter instances', async () => {
    await fileAdapter.close();

    // Create a brand new instance pointing to same directory
    const freshAdapter = new FilePersistenceAdapter(testDataDir);
    await freshAdapter.init();

    // Verify User persisted
    const restoredUser = await freshAdapter.users.get('user_4c_alpha');
    assert(restoredUser !== null, 'User lost after adapter restart');
    assert(restoredUser!.email === 'alpha@orbie.test', 'User data corrupted');

    // Verify Profile persisted
    const restoredProfile = await freshAdapter.profiles.get('prof_alpha_primary');
    assert(restoredProfile !== null, 'Profile lost after adapter restart');
    assert(restoredProfile!.birthCity === 'Curitiba', 'Profile city corrupted');

    // Verify Wallet persisted
    const restoredWallet = await freshAdapter.wallets.get('user_4c_alpha');
    assert(restoredWallet !== null, 'Wallet lost after adapter restart');
    assert(restoredWallet!.balance === 50, 'Wallet balance corrupted');

    // Verify Ledger persisted
    const restoredLedger = await freshAdapter.wallets.getLedger('user_4c_alpha');
    assert(restoredLedger.length === 2, 'Ledger lost after adapter restart');

    // Verify Coupon persisted
    const restoredCoupon = await freshAdapter.coupons.getCoupon('ORB2026');
    assert(restoredCoupon !== null, 'Coupon lost after adapter restart');

    await freshAdapter.close();
  });

  // Test 7: Firestore adapter explicit failure without silent fallback
  await runTest(7, 'Firestore adapter throws FirestoreUnavailableError without fallback', async () => {
    // Intentionally construct Firestore adapter with unprovisioned project
    const unprovisionedAdapter = new FirestorePersistenceAdapter();
    let errorThrown: any = null;

    try {
      await unprovisionedAdapter.init();
    } catch (err: any) {
      errorThrown = err;
    }

    assert(errorThrown !== null, 'Firestore should have failed to initialize');
    assert(
      errorThrown instanceof FirestoreUnavailableError,
      `Expected FirestoreUnavailableError, got ${errorThrown?.constructor?.name}`
    );
    assert(
      !unprovisionedAdapter.getStatus().connected,
      'Status should report not connected'
    );
  });

  // Test 8: Account domain status transition from onboarding_required to active
  await runTest(8, 'Account domain status transitions and persistence', async () => {
    const adapter = new MemoryPersistenceAdapter();
    await adapter.init();

    const newUser: UserEntity = {
      uid: 'user_onboarding_test',
      email: 'onboarding@orbie.test',
      displayName: 'New Onboarding User',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      accountStatus: 'onboarding_required',
      roles: ['user'],
    };

    await adapter.users.save(newUser);
    assert(newUser.accountStatus === 'onboarding_required', 'Initial status must be onboarding_required');

    // Transition to active when primary profile is configured
    newUser.accountStatus = 'active';
    await adapter.users.save(newUser);

    const saved = await adapter.users.get('user_onboarding_test');
    assert(saved!.accountStatus === 'active', 'Account status did not transition to active');
  });

  // Clean up test directory
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }

  console.log('\n====================================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`PHASE 4C SUMMARY: ${passedCount}/${results.length} tests passed`);
  console.log('====================================================\n');

  if (passedCount !== results.length) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
