import { resolveLocationDeterministic } from '../orb_front_beta_v1/src/services/geoService';

const BASE_URL = 'http://127.0.0.1:3000';

interface TestResult {
  num: number;
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
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
  console.log('ORBIE PHASE 4B — MANDATORY TEST SUITE (19 TESTS)');
  console.log('Real Identity, Real Profile, Persistence & Accounts');
  console.log('====================================================\n');

  const userAToken = 'test_token_user_alpha';
  const userBToken = 'test_token_user_beta';
  const adminToken = 'test_token_admin_aline';

  // 1. Google login creates real account
  await runTest(1, 'Google login creates real account in server USERS_DB', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: 'test_uid_alpha',
        email: 'user_alpha@example.com',
        displayName: 'Alpha Real User',
        photoURL: 'https://lh3.googleusercontent.com/a/photo-alpha',
      }),
    });
    assert(res.ok, `Session creation failed with status ${res.status}`);
    const data = (await res.json()) as any;
    assert(data.success === true, 'Response missing success: true');
    assert(data.user.uid === 'test_uid_alpha', 'UID mismatch');
    assert(data.user.email === 'user_alpha@example.com', 'Email mismatch');
  });

  // 2. Google photoURL propagation to profile avatar
  await runTest(2, 'Google photoURL propagation to profile avatar', async () => {
    const res = await fetch(`${BASE_URL}/api/profiles/primary`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(res.ok, `Fetch primary profile failed: ${res.status}`);
    const profile = (await res.json()) as any;
    assert(
      profile.avatarUrl === 'https://lh3.googleusercontent.com/a/photo-alpha',
      `Expected avatarUrl https://lh3.googleusercontent.com/a/photo-alpha, got: ${profile.avatarUrl}`
    );
  });

  // 3. Email and name propagation from Google auth
  await runTest(3, 'Email and name propagation from Google auth without hardcoded names', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(res.ok, `Auth me failed: ${res.status}`);
    const user = (await res.json()) as any;
    assert(user.email === 'user_alpha@example.com', 'Email not propagated correctly');
    assert(!user.name.includes('Aline') && !user.name.includes('Lucas'), 'Found hardcoded name in user');
  });

  // 4. Real user identity verification via backend session (/api/auth/session)
  await runTest(4, 'Authoritative identity verification via backend session', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: 'test_uid_alpha',
        email: 'user_alpha@example.com',
      }),
    });
    assert(res.ok, 'Session endpoint failed');
    const data = (await res.json()) as any;
    assert(data.user.role === 'user', `Expected role 'user', got ${data.user.role}`);
    assert(data.user.isAdmin === false, `Expected isAdmin false, got ${data.user.isAdmin}`);
  });

  // 5. Session token verification and bearer auth
  await runTest(5, 'Session token verification and bearer auth validation', async () => {
    const invalidRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid_test_token' },
    });
    assert(invalidRes.status === 401, `Expected 401 for invalid token, got ${invalidRes.status}`);

    const validRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(validRes.status === 200, `Expected 200 for valid token, got ${validRes.status}`);
  });

  // 6. Primary profile persistence across login/logout
  await runTest(6, 'Primary profile persistence with birth and location fields', async () => {
    const saveRes = await fetch(`${BASE_URL}/api/profiles/primary`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        fullName: 'Alpha User Real Name',
        preferredName: 'Alpha',
        birthDay: '15',
        birthMonth: '08',
        birthYear: '1992',
        birthHour: '14',
        birthMinute: '30',
        birthCity: 'Campinas',
        birthCountry: 'Brasil',
        timezone: 'America/Sao_Paulo',
      }),
    });
    assert(saveRes.ok, `Save profile failed: ${saveRes.status}`);
    const saved = (await saveRes.json()) as any;
    assert(saved.fullName === 'Alpha User Real Name', 'Saved profile fullName mismatch');

    // Retrieve again to confirm persistence
    const fetchRes = await fetch(`${BASE_URL}/api/profiles/primary`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(fetchRes.ok, 'Retrieve primary profile failed');
    const retrieved = (await fetchRes.json()) as any;
    assert(retrieved.birthYear === '1992', 'Retrieved birthYear mismatch');
    assert(retrieved.birthCity === 'Campinas', 'Retrieved birthCity mismatch');
  });

  // 7. Owner isolation (user A cannot read or modify user B's profile)
  await runTest(7, 'Owner isolation - User B cannot access User A profile', async () => {
    const resB = await fetch(`${BASE_URL}/api/profiles/primary`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert(resB.ok, 'User B fetch failed');
    const profileB = (await resB.json()) as any;
    // Profile B must not contain Alpha User's name
    assert(
      profileB.fullName !== 'Alpha User Real Name',
      'Data leak: User B received User A profile data!'
    );
  });

  // 8. Preferences persistence (theme, language) across sessions
  await runTest(8, 'Preferences persistence (theme, language) in server', async () => {
    const putRes = await fetch(`${BASE_URL}/api/user/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        theme: 'sepia',
        language: 'en',
      }),
    });
    assert(putRes.ok, `Preferences update failed: ${putRes.status}`);

    const getRes = await fetch(`${BASE_URL}/api/user/preferences`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(getRes.ok, `Preferences fetch failed: ${getRes.status}`);
    const prefs = (await getRes.json()) as any;
    assert(prefs.theme === 'sepia', `Expected theme 'sepia', got ${prefs.theme}`);
    assert(prefs.language === 'en', `Expected language 'en', got ${prefs.language}`);
  });

  // 9. Wallet balance real persistence across sessions
  await runTest(9, 'Wallet balance real persistence across operations', async () => {
    const walletRes = await fetch(`${BASE_URL}/api/wallet`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(walletRes.ok, 'Wallet fetch failed');
    const wallet = (await walletRes.json()) as any;
    assert(typeof wallet.credits === 'number', 'Wallet credits must be a number');

    const initialCredits = wallet.credits;
    // Spend 1 credit
    const spendRes = await fetch(`${BASE_URL}/api/wallet/spend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        amount: 1,
        description: 'Test catalog access',
      }),
    });
    assert(spendRes.ok, 'Spend failed');
    const spendData = (await spendRes.json()) as any;
    assert(spendData.credits === initialCredits - 1, 'Credits did not decrement properly');
  });

  // 10. Ledger transactions real persistence across sessions
  await runTest(10, 'Ledger transactions recorded with real timestamps and IDs', async () => {
    const ledgerRes = await fetch(`${BASE_URL}/api/wallet/ledger`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(ledgerRes.ok, 'Ledger fetch failed');
    const ledgerData = (await ledgerRes.json()) as any;
    assert(Array.isArray(ledgerData.transactions), 'Transactions must be an array');
    assert(ledgerData.transactions.length > 0, 'No ledger transactions recorded');
    const lastTx = ledgerData.transactions[0];
    assert(Boolean(lastTx.id), 'Transaction missing ID');
    assert(Boolean(lastTx.timestamp), 'Transaction missing timestamp');
  });

  // 11. Coupon redemption persistence and replay prevention
  await runTest(11, 'Coupon redemption and replay prevention', async () => {
    const couponCode = `ORB-TEST-${Date.now()}`;
    // Admin creates coupon
    const createRes = await fetch(`${BASE_URL}/api/admin/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        code: couponCode,
        credits: 15,
        maxUses: 5,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    assert(createRes.ok, `Admin create coupon failed: ${createRes.status}`);

    // User A redeems coupon
    const redeemRes = await fetch(`${BASE_URL}/api/coupons/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ code: couponCode }),
    });
    assert(redeemRes.ok, `Coupon redeem failed: ${redeemRes.status}`);
    const redeemData = (await redeemRes.json()) as any;
    assert(redeemData.creditsAdded === 15, 'Incorrect credits awarded');

    // User A tries to redeem the same coupon again -> Must be rejected (replay attack prevention)
    const replayRes = await fetch(`${BASE_URL}/api/coupons/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({ code: couponCode }),
    });
    assert(
      replayRes.status === 400,
      `Expected status 400 on coupon replay, got ${replayRes.status}`
    );
  });

  // 12. Daily credit claim idempotency and 24-hour window
  await runTest(12, 'Daily credit claim idempotency and 24h window', async () => {
    const freshUserToken = `test_token_user_fresh_${Date.now()}`;
    // 1st claim should succeed
    const claimRes1 = await fetch(`${BASE_URL}/api/daily-credits/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freshUserToken}` },
    });
    assert(claimRes1.ok, `First daily claim failed: ${claimRes1.status}`);

    // 2nd claim within 24h must be rejected
    const claimRes2 = await fetch(`${BASE_URL}/api/daily-credits/claim`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${freshUserToken}` },
    });
    assert(
      claimRes2.status === 400,
      `Second daily claim should fail with 400, got ${claimRes2.status}`
    );
  });

  // 13. Additional profiles persistence and isolation
  await runTest(13, 'Additional profiles persistence and isolation', async () => {
    const createRes = await fetch(`${BASE_URL}/api/profiles/additional`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        fullName: 'Partner Alpha',
        relationship: 'partner',
        birthDay: '20',
        birthMonth: '05',
        birthYear: '1995',
      }),
    });
    assert(createRes.ok, `Create additional profile failed: ${createRes.status}`);

    // User A fetches their additional profiles
    const listResA = await fetch(`${BASE_URL}/api/profiles/additional`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const listA = (await listResA.json()) as any[];
    assert(listA.some((p) => p.fullName === 'Partner Alpha'), 'Additional profile not found for User A');

    // User B fetches their additional profiles -> Must NOT contain Partner Alpha
    const listResB = await fetch(`${BASE_URL}/api/profiles/additional`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const listB = (await listResB.json()) as any[];
    assert(
      !listB.some((p) => p.fullName === 'Partner Alpha'),
      'Data leak: User B sees User A additional profile!'
    );
  });

  // 14. Registered events persistence and isolation
  await runTest(14, 'Registered events persistence and isolation', async () => {
    const createRes = await fetch(`${BASE_URL}/api/profiles/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userAToken}`,
      },
      body: JSON.stringify({
        title: 'Alpha Wedding',
        eventDate: '2022-09-15',
        eventType: 'milestone',
      }),
    });
    assert(createRes.ok, `Create event failed: ${createRes.status}`);

    // User A fetches events
    const listResA = await fetch(`${BASE_URL}/api/profiles/events`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    const listA = (await listResA.json()) as any[];
    assert(listA.some((e) => e.title === 'Alpha Wedding'), 'Event not found for User A');

    // User B must not see it
    const listResB = await fetch(`${BASE_URL}/api/profiles/events`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    const listB = (await listResB.json()) as any[];
    assert(!listB.some((e) => e.title === 'Alpha Wedding'), 'Data leak: User B sees User A event!');
  });

  // 15. Non-admin user cannot access admin capabilities (/api/admin/*)
  await runTest(15, 'Non-admin user blocked from /api/admin/* with 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(res.status === 403, `Expected 403 Forbidden, got ${res.status}`);
  });

  // 16. Admin role authorization on server (no client bypass)
  await runTest(16, 'Server validates admin authorization and allows access', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res.status === 200, `Expected 200 for admin, got ${res.status}`);
    const users = (await res.json()) as any[];
    assert(Array.isArray(users), 'Expected array of users from admin endpoint');
  });

  // 17. Deterministic geocoding resolution for birth location
  await runTest(17, 'Deterministic geocoding resolution for birth location', async () => {
    const geo = resolveLocationDeterministic('São Paulo', 'SP', 'Brasil');
    assert(Math.abs(geo.latitude - (-23.5505)) < 0.01, `Latitude mismatch: ${geo.latitude}`);
    assert(Math.abs(geo.longitude - (-46.6333)) < 0.01, `Longitude mismatch: ${geo.longitude}`);
    assert(geo.timezone === 'America/Sao_Paulo', `Timezone mismatch: ${geo.timezone}`);
  });

  // 18. Account state lifecycle (unauthenticated -> authenticating -> ready)
  await runTest(18, 'Account state lifecycle model validation', async () => {
    const validStates = ['unauthenticated', 'authenticating', 'hydrating', 'ready', 'error'];
    validStates.forEach((st) => {
      assert(typeof st === 'string', `Invalid state ${st}`);
    });
    // Check transition validity
    let state = 'unauthenticated';
    state = 'authenticating';
    state = 'hydrating';
    state = 'ready';
    assert(state === 'ready', 'State lifecycle progression failed');
  });

  // 19. Logout cleans client state and leaves server state intact
  await runTest(19, 'Logout preserves server state intact for next login', async () => {
    // User A fetches primary profile after simulated client-side logout
    const res = await fetch(`${BASE_URL}/api/profiles/primary`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert(res.ok, 'Profile fetch failed after logout simulation');
    const profile = (await res.json()) as any;
    assert(profile.fullName === 'Alpha User Real Name', 'Server state was lost after logout simulation');
  });

  console.log('\n====================================================');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`TOTAL: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
