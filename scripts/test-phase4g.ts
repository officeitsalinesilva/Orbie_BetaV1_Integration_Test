/**
 * ORBIE — Phase 4G Automated Test Suite
 * End-to-end verification of Real Payments (Mercado Pago), Authoritative Quotes,
 * Order Lifecycle, Webhook Reconciliation, Ledger, and Entitlements.
 */

import { initPersistenceAdapter, orderRepo, paymentRepo, walletRepo, profileRepo } from '../server/persistence';
import { commercialService } from '../server/domain/commercial/commercialService';
import { paymentService } from '../server/domain/payments/paymentService';
import { walletService } from '../server/domain/wallet/walletService';

async function runPhase4GTest() {
  console.log('--- STARTING PHASE 4G TEST ---');

  // 1. Initialize persistence and domain services
  const adapter = await initPersistenceAdapter();
  console.log(`[Test] Persistence initialized: driver=${adapter.driver}, durable=${adapter.isDurable}`);

  await commercialService.init();
  console.log('[Test] CommercialService initialized');

  const testUserId = `test-user-4g-${Date.now()}`;

  // Ensure primary profile and wallet exist for test user
  await profileRepo.save({
    id: `prof-${testUserId}`,
    ownerUid: testUserId,
    isPrimary: true,
    fullName: 'Test User 4G',
    preferredName: 'Tester',
    birthDay: '15',
    birthMonth: '06',
    birthYear: '1990',
    birthHour: '12',
    birthMinute: '00',
    birthCity: 'São Paulo',
    birthCountry: 'Brasil',
    timezone: 'America/Sao_Paulo',
    latitude: -23.55,
    longitude: -46.63,
    tz_str: 'America/Sao_Paulo',
    unlockedItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const initialWallet = await walletService.getOrCreateWallet(testUserId);
  const initialBalance = initialWallet.balance;
  console.log(`[Test] Initial user credit balance: ${initialBalance}`);

  // 2. Authoritative Price Quote Generation
  console.log('\n--- 1. Testing Authoritative Price Quote ---');
  const quote = await commercialService.quotePrice({
    productId: 'CRD-PACK-50',
    billingCountry: 'BR',
    selectedCountry: 'BR',
  });

  if (!quote.quoteId) throw new Error('Quote has no quoteId');
  if (quote.finalPriceInCents <= 0) throw new Error('Quote finalPriceInCents is not positive');
  console.log(`[Pass] Generated Authoritative Quote ${quote.quoteId}: ${quote.currency} ${(quote.finalPriceInCents / 100).toFixed(2)}`);

  // 3. Order Creation & PIX Checkout
  console.log('\n--- 2. Testing Order Creation & PIX Checkout ---');
  const pixCheckout = await paymentService.createOrderFromQuote({
    userId: testUserId,
    quoteId: quote.quoteId,
    paymentMethodPreference: 'pix',
    payerEmail: 'tester@orbie.app',
    payerName: 'Tester 4G',
    payerIdentification: { type: 'CPF', number: '19119119100' },
  });

  if (!pixCheckout.orderId) throw new Error('No orderId returned');
  if (!pixCheckout.pix?.qrCode) throw new Error('No PIX qrCode returned');
  console.log(`[Pass] Order created: ${pixCheckout.orderId}, Status: ${pixCheckout.status}`);

  const orderBefore = await orderRepo.get(pixCheckout.orderId);
  if (!orderBefore) throw new Error('Order not found in repository');
  if (orderBefore.status !== 'CHECKOUT_CREATED') throw new Error(`Expected CHECKOUT_CREATED, got ${orderBefore.status}`);
  console.log(`[Pass] Order persisted with amount ${orderBefore.amountInCents} cents, currency ${orderBefore.currency}`);

  // 4. Authoritative Webhook Reconciliation & Approval
  console.log('\n--- 3. Testing Webhook Reconciliation & Fulfillment ---');
  const paymentProviderId = pixCheckout.pix.providerPaymentId || pixCheckout.pix.paymentId || pixCheckout.providerReference;
  console.log(`[Test] Reconciling payment via providerPaymentId: ${paymentProviderId}`);
  const webhookResult = await paymentService.simulatePaymentApproval(paymentProviderId);

  if (!webhookResult.processed) throw new Error('Webhook was not processed');
  console.log(`[Pass] Webhook result:`, webhookResult);

  // Verify Order transitioned to PAID
  const orderAfter = await orderRepo.get(pixCheckout.orderId);
  if (!orderAfter || orderAfter.status !== 'PAID') {
    throw new Error(`Expected order status PAID, got ${orderAfter?.status}`);
  }
  console.log(`[Pass] Order ${orderAfter.orderId} updated to PAID`);

  // Verify Wallet Credits & Ledger
  const walletAfter = await walletService.getOrCreateWallet(testUserId);
  console.log(`[Pass] Wallet balance after payment: ${walletAfter.balance} (was ${initialBalance})`);
  if (walletAfter.balance <= initialBalance) {
    throw new Error('Credits were not granted to user wallet');
  }

  const ledgerEntries = await walletRepo.getLedger(testUserId);
  const purchaseEntry = ledgerEntries.find((l) => l.referenceId === pixCheckout.orderId);
  if (!purchaseEntry) {
    throw new Error('No ledger entry found matching orderId');
  }
  if (purchaseEntry.category !== 'PURCHASE' || purchaseEntry.source !== 'PURCHASE') {
    throw new Error(`Unexpected ledger category/source: ${purchaseEntry.category}/${purchaseEntry.source}`);
  }
  console.log(`[Pass] Immutable Financial Ledger verified: ID ${purchaseEntry.id}, desc: "${purchaseEntry.description}"`);

  // 5. Strict Idempotency Test
  console.log('\n--- 4. Testing Webhook Idempotency ---');
  const duplicateWebhook = await paymentService.simulatePaymentApproval(paymentProviderId);
  console.log(`[Pass] Duplicate webhook result:`, duplicateWebhook);

  const walletAfterDuplicate = await walletService.getOrCreateWallet(testUserId);
  if (walletAfterDuplicate.balance !== walletAfter.balance) {
    throw new Error(`Idempotency failure: Balance changed on duplicate webhook from ${walletAfter.balance} to ${walletAfterDuplicate.balance}`);
  }
  console.log(`[Pass] Balance remained exactly ${walletAfter.balance}. Zero double-credit / double-entitlement.`);

  // 6. Test Library Item Purchase & Entitlement
  console.log('\n--- 5. Testing Library Item Purchase & Unlock ---');
  const libraryQuote = await commercialService.quotePrice({
    productId: 'AST-001',
    billingCountry: 'BR',
    selectedCountry: 'BR',
  });

  const libCheckout = await paymentService.createOrderFromQuote({
    userId: testUserId,
    quoteId: libraryQuote.quoteId,
    paymentMethodPreference: 'preference',
    payerEmail: 'tester@orbie.app',
    payerName: 'Tester 4G',
  });

  console.log(`[Pass] Library Order created: ${libCheckout.orderId}`);
  await paymentService.simulatePaymentApproval(libCheckout.providerReference!);

  const primaryProfile = await profileRepo.getPrimary(testUserId);
  if (!primaryProfile?.unlockedItems?.includes('AST-001')) {
    throw new Error('Library item AST-001 was not unlocked in primary profile');
  }
  console.log(`[Pass] Library item AST-001 successfully unlocked in user profile`);

  console.log('\n=============================================');
  console.log('PHASE 4G TEST COMPLETED SUCCESSFULLY! ALL PASS!');
  console.log('=============================================\n');
}

runPhase4GTest().catch((err) => {
  console.error('\n[PHASE 4G TEST FAILED]:', err);
  process.exit(1);
});
