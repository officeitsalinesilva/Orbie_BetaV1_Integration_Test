/**
 * ORBIE — PHASE 4E TEST SUITE
 * Central Admin: Coupons, Campaigns, QR Tokens, Notifications & Distribution
 * Server-authoritative, durable persistence, RBAC-protected, no false seed data.
 */

import assert from 'assert';
import http from 'http';
import express from 'express';
import {
  authenticateRequest,
  requireAuth,
  requireAdmin,
  ROOT_ADMIN_EMAIL,
} from '../server/auth';
import { couponService } from '../server/domain/coupons/couponService';
import { walletService } from '../server/domain/wallet/walletService';
import {
  userRepo,
  couponRepo,
  notificationRepo,
  communicationRepo,
  setPersistenceAdapterForTesting,
} from '../server/persistence';
import { MemoryPersistenceAdapter } from '../server/persistence/adapters/memoryAdapter';

const app = express();
app.use(express.json());
app.use(authenticateRequest);

// Endpoints under test
app.post('/api/coupons/redeem', requireAuth, async (req, res) => {
  try {
    const uid = req.user!.uid;
    const { code, qrReference, token } = req.body || {};
    const targetRef = (code || qrReference || token || '').trim();
    if (!targetRef) return res.status(400).json({ error: 'Código ou referência é obrigatório.' });
    const result = await couponService.redeemCoupon(uid, targetRef);
    return res.json({ ...result, creditsAdded: result.creditsGranted });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/coupons/active-alerts', requireAuth, async (req, res) => {
  const uid = req.user!.uid;
  const alerts = await couponService.getUserCouponAlerts(uid);
  return res.json({ alerts });
});

app.get('/api/admin/coupons/campaigns', requireAdmin, async (req, res) => {
  const campaigns = await couponService.getCampaigns();
  return res.json({ campaigns });
});

app.post('/api/admin/coupons/campaigns', requireAdmin, async (req, res) => {
  try {
    const campaign = await couponService.createCampaign(req.body, req.user!.uid);
    return res.status(201).json({ campaign });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/coupons/campaigns/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const updated = await couponService.updateCampaignStatus(req.params.id, status, req.user!.uid);
    if (!updated) return res.status(404).json({ error: 'Campanha não encontrada' });
    return res.json({ campaign: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/coupons', requireAdmin, async (req, res) => {
  const coupons = await couponService.getCoupons();
  const campaigns = await couponService.getCampaigns();
  const campMap = new Map(campaigns.map((c) => [c.id, c]));
  const enriched = coupons.map((c) => ({
    ...c,
    campaign: campMap.get(c.campaignId) || null,
  }));
  return res.json({ coupons: enriched });
});

app.post('/api/admin/coupons', requireAdmin, async (req, res) => {
  try {
    const { code, credits, maxUses, expiresAt, campaignId } = req.body || {};
    if (!code) return res.status(400).json({ error: 'Código é obrigatório' });
    let targetCampaignId = campaignId;
    let campaign: any = null;
    if (!targetCampaignId) {
      const now = Date.now();
      campaign = await couponService.createCampaign({
        title: `Campanha ${code}`,
        description: `Cupom ${code}`,
        creditsPerWithdrawal: Number(credits) || 10,
        validityDays: 30,
        withdrawalFrequencyHours: 0,
        maxUsesPerUser: 1,
        startDate: new Date(now - 3600000).toISOString(),
        endDate: expiresAt || new Date(now + 30 * 86400000).toISOString(),
        status: 'active',
      }, req.user!.uid);
      targetCampaignId = campaign.id;
    }
    const coupon = await couponService.createCoupon(targetCampaignId, code, Number(maxUses) || 100, req.user!.uid);
    return res.status(201).json({ coupon, campaign });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/coupons/generate', requireAdmin, async (req, res) => {
  try {
    const { campaignId, code, maxTotalRedemptions } = req.body;
    const coupon = await couponService.createCoupon(campaignId, code, maxTotalRedemptions, req.user!.uid);
    return res.status(201).json({ coupon });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.patch('/api/admin/coupons/:code/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body || {};
    const updated = await couponService.updateCouponStatus(req.params.code, status, req.user!.uid);
    if (!updated) return res.status(404).json({ error: 'Cupom não encontrado' });
    return res.json({ coupon: updated });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.post('/api/admin/coupons/distribute', requireAdmin, async (req, res) => {
  try {
    const { couponCode, targetUserUids, sendNotification, customNotificationMessage } = req.body || {};
    const distribution = await couponService.distributeCoupon({
      adminUid: req.user!.uid,
      couponCode,
      targetUserUids,
      sendNotification: sendNotification !== false,
      customNotificationMessage,
    });
    return res.status(201).json({ distribution });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/coupons/distributions', requireAdmin, async (req, res) => {
  const distributions = await couponService.getDistributions();
  return res.json({ distributions });
});

app.get('/api/admin/notifications', requireAdmin, async (req, res) => {
  const notifications = await notificationRepo.listAll();
  return res.json({ notifications });
});

app.post('/api/admin/notifications', requireAdmin, async (req, res) => {
  try {
    const { title, body, targetUserUid, broadcast, channel } = req.body || {};
    let targets: string[] = [];
    if (broadcast) {
      const allUsers = await userRepo.list();
      targets = allUsers.map((u) => u.uid);
    } else if (targetUserUid) {
      targets = [targetUserUid];
    } else {
      return res.status(400).json({ error: 'Informe targetUserUid ou broadcast' });
    }
    for (const uid of targets) {
      await notificationRepo.save({
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ownerUid: uid,
        channel: channel || 'push',
        title,
        body,
        status: 'sent',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
      });
    }
    return res.status(201).json({ success: true, count: targets.length });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/communications/drafts', requireAdmin, async (req, res) => {
  const drafts = await communicationRepo.listDrafts();
  return res.json({ drafts });
});

app.post('/api/admin/communications/drafts', requireAdmin, async (req, res) => {
  try {
    const { title, body, channel } = req.body || {};
    const draft = {
      id: `draft-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title || '',
      body: body || '',
      channel: channel || 'push',
      status: 'draft',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await communicationRepo.saveDraft(draft);
    return res.status(201).json({ draft });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/audit-logs', requireAdmin, async (req, res) => {
  const logs = await couponService.getAuditLogs();
  return res.json({ logs });
});

async function runTests() {
  console.log('====================================================');
  console.log('ORBIE PHASE 4E — TEST SUITE');
  console.log('Central Admin: Coupons, Campaigns, QR, Notifications & Distribution');
  console.log('====================================================');

  const testAdapter = new MemoryPersistenceAdapter();
  await testAdapter.init();
  setPersistenceAdapterForTesting(testAdapter);

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const port = (server.address() as any).port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const adminToken = 'test_token_admin_aline';
  const userToken = 'test_token_user_beta';

  // Register users in testAdapter
  await userRepo.save({ uid: 'test_uid_admin_aline', email: ROOT_ADMIN_EMAIL, role: 'admin', createdAt: new Date().toISOString() });
  await userRepo.save({ uid: 'test_uid_beta', email: 'user_beta@example.com', role: 'user', createdAt: new Date().toISOString() });
  await userRepo.save({ uid: 'test_uid_gamma', email: 'user_gamma@example.com', role: 'user', createdAt: new Date().toISOString() });

  try {
    // Test 1: Clean slate - No false production seed data exists initially
    console.log('✓ Test 1: Clean slate verification (no hardcoded ORB-WELCOME-7D seed)');
    const initialCoupons = await couponService.getCoupons();
    assert.strictEqual(initialCoupons.length, 0, 'Coupons must be empty initially (no false seeds)');
    const initialCampaigns = await couponService.getCampaigns();
    assert.strictEqual(initialCampaigns.length, 0, 'Campaigns must be empty initially (no false seeds)');

    // Test 2: Non-admin blocked from /api/admin/* (RBAC HTTP 403)
    console.log('✓ Test 2: Non-admin blocked from Central Admin Coupon APIs with HTTP 403');
    const forbiddenRes = await fetch(`${baseUrl}/api/admin/coupons/campaigns`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(forbiddenRes.status, 403, 'User must be blocked from admin campaigns');

    // Test 3: Admin creates a real campaign
    console.log('✓ Test 3: Admin creates canonical promotional campaign');
    const now = Date.now();
    const createCampRes = await fetch(`${baseUrl}/api/admin/coupons/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Campanha Solstício 2026',
        description: 'Receba 5 créditos diários durante 7 dias',
        creditsPerWithdrawal: 5,
        validityDays: 7,
        withdrawalFrequencyHours: 24,
        maxUsesPerUser: 7,
        startDate: new Date(now - 3600000).toISOString(),
        endDate: new Date(now + 30 * 86400000).toISOString(),
        status: 'active',
      }),
    });
    assert.strictEqual(createCampRes.status, 201);
    const campData = await createCampRes.json();
    const campaignId = campData.campaign.id;
    assert.ok(campaignId, 'Campaign id must be returned');

    // Test 4: Admin generates Coupon with cryptographic QR reference token
    console.log('✓ Test 4: Admin generates coupon with cryptographic QR token');
    const genCouponRes = await fetch(`${baseUrl}/api/admin/coupons/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        campaignId,
        code: 'SOLSTICIO-7D',
        maxTotalRedemptions: 500,
      }),
    });
    assert.strictEqual(genCouponRes.status, 201);
    const couponData = await genCouponRes.json();
    assert.strictEqual(couponData.coupon.code, 'SOLSTICIO-7D');
    assert.ok(couponData.coupon.qrReference, 'qrReference token must be generated');

    // Test 5: Admin lists coupons and verifies campaign enrichment
    console.log('✓ Test 5: Admin lists coupons with campaign enrichment');
    const listRes = await fetch(`${baseUrl}/api/admin/coupons`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.strictEqual(listData.coupons.length, 1);
    assert.strictEqual(listData.coupons[0].campaign.title, 'Campanha Solstício 2026');

    // Test 6: User redeems coupon (withdrawal #1)
    console.log('✓ Test 6: User redeems coupon withdrawal #1 and receives credits in ledger');
    const redeemRes = await fetch(`${baseUrl}/api/coupons/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ code: 'SOLSTICIO-7D' }),
    });
    assert.strictEqual(redeemRes.status, 200);
    const redeemData = await redeemRes.json();
    assert.strictEqual(redeemData.success, true);
    assert.strictEqual(redeemData.withdrawalNumber, 1);
    assert.strictEqual(redeemData.creditsGranted, 5);

    // Verify wallet balance
    const wallet = walletService.getWallet('test_uid_beta');
    assert.strictEqual(wallet.balance, 5, 'User balance must be 5 credits');

    // Test 7: Immediate replay blocked by 24h withdrawal frequency window
    console.log('✓ Test 7: Immediate repeat withdrawal blocked by 24h window constraint');
    const replayRes = await fetch(`${baseUrl}/api/coupons/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ code: 'SOLSTICIO-7D' }),
    });
    assert.strictEqual(replayRes.status, 400);
    const replayData = await replayRes.json();
    assert.ok(replayData.error.includes('24 horas'), 'Error message must mention 24 hour interval');

    // Test 8: Admin distributes coupon to target user with in-app notification
    console.log('✓ Test 8: Admin distributes coupon with targeted in-app notification');
    const distRes = await fetch(`${baseUrl}/api/admin/coupons/distribute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        couponCode: 'SOLSTICIO-7D',
        targetUserUids: ['test_uid_gamma'],
        sendNotification: true,
        customNotificationMessage: 'Aproveite 5 créditos diários durante o Solstício!',
      }),
    });
    assert.strictEqual(distRes.status, 201);
    const distData = await distRes.json();
    assert.strictEqual(distData.distribution.couponCode, 'SOLSTICIO-7D');
    assert.strictEqual(distData.distribution.targetCount, 1);

    // Verify notification was delivered to gamma
    const gammaNotifs = await notificationRepo.findByOwner('test_uid_gamma');
    assert.strictEqual(gammaNotifs.length, 1);
    assert.ok(gammaNotifs[0].title.includes('SOLSTICIO-7D'));

    // Test 9: Admin lists distributions
    console.log('✓ Test 9: Admin lists all coupon distributions');
    const listDistRes = await fetch(`${baseUrl}/api/admin/coupons/distributions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(listDistRes.status, 200);
    const listDistData = await listDistRes.json();
    assert.strictEqual(listDistData.distributions.length, 1);

    // Test 10: Admin Central de Notificações (list and broadcast)
    console.log('✓ Test 10: Admin Central de Notificações - Broadcast & List');
    const broadcastRes = await fetch(`${baseUrl}/api/admin/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Mensagem Central Orbie',
        body: 'Alinhamento astrológico de lua nova hoje!',
        broadcast: true,
      }),
    });
    assert.strictEqual(broadcastRes.status, 201);
    const bcastData = await broadcastRes.json();
    assert.strictEqual(bcastData.count, 3, 'Broadcast should send to all 3 registered users');

    const allNotifsRes = await fetch(`${baseUrl}/api/admin/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const allNotifsData = await allNotifsRes.json();
    assert.ok(allNotifsData.notifications.length >= 4);

    // Test 11: Admin Communications Drafts
    console.log('✓ Test 11: Admin Communications Drafts - Save and list');
    const draftRes = await fetch(`${baseUrl}/api/admin/communications/drafts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Rascunho Campanha Primavera',
        body: 'Em breve cupons exclusivos para assinantes.',
      }),
    });
    assert.strictEqual(draftRes.status, 201);
    const draftListRes = await fetch(`${baseUrl}/api/admin/communications/drafts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const draftListData = await draftListRes.json();
    assert.strictEqual(draftListData.drafts.length, 1);

    // Test 12: Admin Audit Logs
    console.log('✓ Test 12: Admin Audit Logs verification');
    const auditRes = await fetch(`${baseUrl}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(auditRes.status, 200);
    const auditData = await auditRes.json();
    assert.ok(auditData.logs.length >= 3, 'Audit logs must capture campaign, coupon and distribution actions');

    // Test 13: Coupon lifecycle disabling
    console.log('✓ Test 13: Coupon lifecycle - Disabling prevents redemption');
    const disableRes = await fetch(`${baseUrl}/api/admin/coupons/SOLSTICIO-7D/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'disabled' }),
    });
    assert.strictEqual(disableRes.status, 200);

    const gammaRedeemRes = await fetch(`${baseUrl}/api/coupons/redeem`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer test_token_user_gamma`,
      },
      body: JSON.stringify({ code: 'SOLSTICIO-7D' }),
    });
    assert.strictEqual(gammaRedeemRes.status, 400);
    const gammaErr = await gammaRedeemRes.json();
    assert.ok(gammaErr.error.includes('inativo ou expirado'));

    console.log('====================================================');
    console.log('PHASE 4E SUMMARY: ALL 13 TESTS PASSED');
    console.log('====================================================');
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    setPersistenceAdapterForTesting(null);
  }
}

void runTests();
