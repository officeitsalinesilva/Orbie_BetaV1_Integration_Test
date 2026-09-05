import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  QrCode,
  Tag,
  Send,
  Bell,
  Check,
  AlertCircle,
  Clock,
  Users,
  Shield,
  FileText,
  RefreshCw,
  Eye,
  Copy,
  Globe,
  Crown,
  Sliders,
  History,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { useOrb } from '../../context/OrbContext';
import { AdminCommercialProductsTab } from './commercial/AdminCommercialProductsTab';
import { AdminCommercialPricingTab } from './commercial/AdminCommercialPricingTab';
import { AdminCommercialPlansTab } from './commercial/AdminCommercialPlansTab';
import { AdminCommercialAuditTab } from './commercial/AdminCommercialAuditTab';

type Tab =
  | 'products'
  | 'pricing'
  | 'plans'
  | 'campaigns'
  | 'coupons'
  | 'distribution'
  | 'notifications'
  | 'audit';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function AdminCouponCenterModal({ isOpen, onClose }: Props) {
  const { preferences, isAdmin, refreshWallet } = useOrb();
  const isEnglish = preferences.language === 'en';

  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Commercial Data states (Fase 4F)
  const [commercialProducts, setCommercialProducts] = useState<any[]>([]);
  const [commercialRegions, setCommercialRegions] = useState<any[]>([]);
  const [commercialPlans, setCommercialPlans] = useState<any[]>([]);
  const [commercialDailyRule, setCommercialDailyRule] = useState<any | null>(null);
  const [commercialVersions, setCommercialVersions] = useState<any[]>([]);

  // Data states
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [distributions, setDistributions] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Create Campaign Form State
  const [campTitle, setCampTitle] = useState('');
  const [campDesc, setCampDesc] = useState('');
  const [campCredits, setCampCredits] = useState(10);
  const [campValidityDays, setCampValidityDays] = useState(30);
  const [campFreqHours, setCampFreqHours] = useState(24);
  const [campMaxUsesPerUser, setCampMaxUsesPerUser] = useState(1);
  const [showNewCampForm, setShowNewCampForm] = useState(false);

  // Create Coupon Form State
  const [couponCode, setCouponCode] = useState('');
  const [selectedCampId, setSelectedCampId] = useState('');
  const [couponMaxTotal, setCouponMaxTotal] = useState(100);
  const [showNewCouponForm, setShowNewCouponForm] = useState(false);

  // Distribution Form State
  const [distCouponCode, setDistCouponCode] = useState('');
  const [distTargetType, setDistTargetType] = useState<'all' | 'specific'>('all');
  const [distTargetUid, setDistTargetUid] = useState('');
  const [distSendNotification, setDistSendNotification] = useState(true);
  const [distCustomMessage, setDistCustomMessage] = useState('');

  // Notification Broadcast Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTargetType, setNotifTargetType] = useState<'all' | 'specific'>('all');
  const [notifTargetUid, setNotifTargetUid] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const [
        campRes,
        coupRes,
        distRes,
        redRes,
        notifRes,
        draftsRes,
        auditRes,
        usersRes,
        prodRes,
        regRes,
        plansRes,
        dailyRes,
        versRes,
      ] = await Promise.all([
        adminApi.getCampaigns().catch(() => ({ campaigns: [] })),
        adminApi.getCoupons().catch(() => ({ coupons: [] })),
        adminApi.getDistributions().catch(() => ({ distributions: [] })),
        adminApi.getRedemptions().catch(() => ({ redemptions: [] })),
        adminApi.getNotifications().catch(() => ({ notifications: [] })),
        adminApi.getCommunicationDrafts().catch(() => ({ drafts: [] })),
        adminApi.getAuditLogs().catch(() => ({ logs: [] })),
        adminApi.getUsers().catch(() => ({ users: [] })),
        adminApi.getCommercialProducts().catch(() => ({ products: [] })),
        adminApi.getCommercialRegions().catch(() => ({ regions: [] })),
        adminApi.getCommercialPlans().catch(() => ({ plans: [] })),
        adminApi.getCommercialDailyCredits().catch(() => ({ rule: null })),
        adminApi.getCommercialVersions().catch(() => ({ versions: [] })),
      ]);

      setCampaigns(campRes.campaigns || []);
      setCoupons(coupRes.coupons || []);
      setDistributions(distRes.distributions || []);
      setRedemptions(redRes.redemptions || []);
      setNotifications(notifRes.notifications || []);
      setDrafts(draftsRes.drafts || []);
      setAuditLogs(auditRes.logs || []);
      setUsers(usersRes.users || []);
      setCommercialProducts(prodRes.products || []);
      setCommercialRegions(regRes.regions || []);
      setCommercialPlans(plansRes.plans || []);
      setCommercialDailyRule(dailyRes.rule || null);
      setCommercialVersions(versRes.versions || []);

      if (campRes.campaigns?.length && !selectedCampId) {
        setSelectedCampId(campRes.campaigns[0].id);
      }
      if (coupRes.coupons?.length && !distCouponCode) {
        setDistCouponCode(coupRes.coupons[0].code);
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao carregar dados do admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Create Campaign Handler
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campTitle.trim()) {
      showToast('Título da campanha é obrigatório.', 'error');
      return;
    }
    try {
      setLoading(true);
      const now = Date.now();
      await adminApi.createCampaign({
        title: campTitle.trim(),
        description: campDesc.trim(),
        creditsPerWithdrawal: Number(campCredits) || 10,
        validityDays: Number(campValidityDays) || 30,
        withdrawalFrequencyHours: Number(campFreqHours) || 0,
        maxUsesPerUser: Number(campMaxUsesPerUser) || 1,
        startDate: new Date(now - 3600000).toISOString(),
        endDate: new Date(now + (Number(campValidityDays) || 30) * 86400000).toISOString(),
        status: 'active',
      });
      showToast('Campanha criada com sucesso!');
      setCampTitle('');
      setCampDesc('');
      setShowNewCampForm(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar campanha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Toggle Campaign Status
  const handleToggleCampaignStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      setLoading(true);
      await adminApi.updateCampaignStatus(id, nextStatus);
      showToast(`Status da campanha alterado para ${nextStatus}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status da campanha.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Create Coupon Handler
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampId) {
      showToast('Selecione uma campanha.', 'error');
      return;
    }
    try {
      setLoading(true);
      await adminApi.generateCoupon({
        campaignId: selectedCampId,
        code: couponCode.trim() ? couponCode.trim().toUpperCase() : undefined,
        maxTotalRedemptions: Number(couponMaxTotal) || 100,
      });
      showToast('Cupom e QR Token gerados com sucesso!');
      setCouponCode('');
      setShowNewCouponForm(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao gerar cupom.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Toggle Coupon Status
  const handleToggleCouponStatus = async (code: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      setLoading(true);
      await adminApi.updateCouponStatus(code, nextStatus);
      showToast(`Status do cupom ${code} alterado para ${nextStatus}`);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar status do cupom.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 5. Distribute Coupon Handler
  const handleDistribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distCouponCode) {
      showToast('Selecione um cupom para distribuição.', 'error');
      return;
    }
    try {
      setLoading(true);
      let targetUids: string[] | undefined = undefined;
      if (distTargetType === 'specific' && distTargetUid) {
        targetUids = [distTargetUid];
      }
      const res = await adminApi.distributeCoupon({
        couponCode: distCouponCode,
        targetUserUids: targetUids,
        sendNotification: distSendNotification,
        customNotificationMessage: distCustomMessage.trim() || undefined,
      });
      showToast(`Cupom distribuído para ${res.distribution.targetCount} usuário(s)!`);
      setDistCustomMessage('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro na distribuição.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 6. Send Notification Handler
  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) {
      showToast('Título e conteúdo são obrigatórios.', 'error');
      return;
    }
    try {
      setLoading(true);
      await adminApi.sendNotification({
        title: notifTitle.trim(),
        body: notifBody.trim(),
        broadcast: notifTargetType === 'all',
        targetUserUid: notifTargetType === 'specific' ? notifTargetUid : undefined,
      });
      showToast('Notificação despachada com sucesso!');
      setNotifTitle('');
      setNotifBody('');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Erro ao enviar notificação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative flex flex-col h-[92vh] max-h-[880px] w-full max-w-5xl rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
              <Shield size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-[var(--foreground)] font-mono uppercase">
                {isEnglish ? 'Central Admin — Coupons & Campaigns' : 'Central Admin — Cupons & Campanhas'}
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                {isEnglish
                  ? 'Server-authoritative engine for promotions, QR distribution and push notifications.'
                  : 'Gestão autoritativa de promoções, QR tokens, distribuição e notificações.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadData}
              title="Atualizar dados"
              disabled={loading}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 border-b border-[var(--border)] bg-[var(--surface-2)] px-6 py-2 overflow-x-auto shrink-0 font-mono text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <Tag size={13} />
            <span>{isEnglish ? 'Products' : 'Produtos & Catálogo'}</span>
            <span className="ml-1 text-[10px] opacity-80">({commercialProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <Globe size={13} />
            <span>{isEnglish ? 'Pricing & Regions' : 'Pricing & Regiões'}</span>
            <span className="ml-1 text-[10px] opacity-80">({commercialRegions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <Crown size={13} />
            <span>{isEnglish ? 'Plans & Credits' : 'Planos & Créditos'}</span>
            <span className="ml-1 text-[10px] opacity-80">({commercialPlans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('campaigns')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <Sliders size={13} />
            <span>{isEnglish ? 'Campaigns' : 'Campanhas'}</span>
            <span className="ml-1 text-[10px] opacity-80">({campaigns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('coupons')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'coupons'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <QrCode size={13} />
            <span>{isEnglish ? 'Coupons & QR' : 'Cupons & QR'}</span>
            <span className="ml-1 text-[10px] opacity-80">({coupons.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('distribution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'distribution'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <Send size={13} />
            <span>{isEnglish ? 'Distribution' : 'Distribuição'}</span>
            <span className="ml-1 text-[10px] opacity-80">({distributions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <Bell size={13} />
            <span>{isEnglish ? 'Notifications' : 'Notificações'}</span>
            <span className="ml-1 text-[10px] opacity-80">({notifications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
            }`}
          >
            <History size={13} />
            <span>{isEnglish ? 'Audit & Versions' : 'Auditoria & Versões'}</span>
            <span className="ml-1 text-[10px] opacity-80">({commercialVersions.length + redemptions.length})</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toast && (
          <div
            className={`mx-6 mt-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-mono transition-all ${
              toast.type === 'error'
                ? 'bg-[var(--destructive)]/15 text-[var(--destructive)] border border-[var(--destructive)]/30'
                : 'bg-[var(--accent)]/15 text-[var(--foreground)] border border-[var(--accent)]/30'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={14} /> : <Check size={14} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 0A: COMMERCIAL PRODUCTS & CATALOG (Fase 4F) */}
          {activeTab === 'products' && (
            <AdminCommercialProductsTab
              products={commercialProducts}
              loading={loading}
              onRefresh={loadData}
              showToast={showToast}
              isEnglish={isEnglish}
            />
          )}

          {/* TAB 0B: PRICING & REGIONAL POLICIES (Fase 4F) */}
          {activeTab === 'pricing' && (
            <AdminCommercialPricingTab
              regions={commercialRegions}
              products={commercialProducts}
              loading={loading}
              onRefresh={loadData}
              showToast={showToast}
              isEnglish={isEnglish}
            />
          )}

          {/* TAB 0C: PLANS & DAILY CREDITS (Fase 4F) */}
          {activeTab === 'plans' && (
            <AdminCommercialPlansTab
              plans={commercialPlans}
              dailyRule={commercialDailyRule}
              loading={loading}
              onRefresh={loadData}
              showToast={showToast}
              isEnglish={isEnglish}
            />
          )}

          {/* TAB 1: CAMPAIGNS */}
          {activeTab === 'campaigns' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] font-mono">
                    {isEnglish ? 'Promotional Campaigns' : 'Campanhas Promocionais'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isEnglish
                      ? 'Configure credit grants, withdrawal frequency windows and validity terms.'
                      : 'Configure concessão de créditos, frequência de saques e prazos de validade.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCampForm(!showNewCampForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>{showNewCampForm ? (isEnglish ? 'Cancel' : 'Cancelar') : (isEnglish ? 'New Campaign' : 'Nova Campanha')}</span>
                </button>
              </div>

              {/* New Campaign Form */}
              {showNewCampForm && (
                <form
                  onSubmit={handleCreateCampaign}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4 font-mono text-xs animate-in fade-in duration-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Campaign Title *' : 'Título da Campanha *'}
                      </label>
                      <input
                        type="text"
                        value={campTitle}
                        onChange={(e) => setCampTitle(e.target.value)}
                        placeholder="Ex: Lançamento Solstício 2026"
                        required
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Description' : 'Descrição'}
                      </label>
                      <input
                        type="text"
                        value={campDesc}
                        onChange={(e) => setCampDesc(e.target.value)}
                        placeholder="Ex: 5 créditos por dia durante 7 dias"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Credits per Withdrawal' : 'Créditos por Saque'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={campCredits}
                        onChange={(e) => setCampCredits(Number(e.target.value))}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Validity (Days)' : 'Validade (Dias)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={campValidityDays}
                        onChange={(e) => setCampValidityDays(Number(e.target.value))}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Interval Between Withdrawals (Hours)' : 'Intervalo Entre Saques (Horas)'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="168"
                        value={campFreqHours}
                        onChange={(e) => setCampFreqHours(Number(e.target.value))}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {isEnglish ? '0 = single withdrawal. 24 = 1 withdrawal per day.' : '0 = saque único. 24 = 1 saque a cada 24 horas.'}
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Max Withdrawals per User' : 'Máximo de Saques por Usuário'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={campMaxUsesPerUser}
                        onChange={(e) => setCampMaxUsesPerUser(Number(e.target.value))}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
                    >
                      {isEnglish ? 'Save Campaign' : 'Salvar Campanha'}
                    </button>
                  </div>
                </form>
              )}

              {/* Campaigns List */}
              <div className="space-y-3 font-mono">
                {campaigns.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border)] p-8 text-center text-xs text-[var(--text-secondary)]">
                    {isEnglish ? 'No active campaigns yet.' : 'Nenhuma campanha cadastrada no momento.'}
                  </div>
                ) : (
                  campaigns.map((camp) => (
                    <div
                      key={camp.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--foreground)]">{camp.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              camp.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)]">{camp.description}</p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-tertiary)] pt-1">
                          <span>◎ {camp.creditsPerWithdrawal} créditos/saque</span>
                          <span>·</span>
                          <span>Frequência: {camp.withdrawalFrequencyHours}h</span>
                          <span>·</span>
                          <span>Máx {camp.maxUsesPerUser} saques/user</span>
                          <span>·</span>
                          <span>Validade: {camp.validityDays} dias</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCampaignStatus(camp.id, camp.status)}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                        >
                          {camp.status === 'active' ? (isEnglish ? 'Pause' : 'Pausar') : (isEnglish ? 'Activate' : 'Ativar')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: COUPONS & QR */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--foreground)] font-mono">
                    {isEnglish ? 'Coupons & QR Reference Tokens' : 'Cupons & Tokens de Referência QR'}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isEnglish
                      ? 'Generate codes and cryptographic QR tokens for promotional redemption.'
                      : 'Gere códigos e tokens criptográficos QR para resgate promocional.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewCouponForm(!showNewCouponForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus size={14} />
                  <span>{showNewCouponForm ? (isEnglish ? 'Cancel' : 'Cancelar') : (isEnglish ? 'Generate Coupon' : 'Gerar Cupom')}</span>
                </button>
              </div>

              {/* New Coupon Form */}
              {showNewCouponForm && (
                <form
                  onSubmit={handleCreateCoupon}
                  className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4 font-mono text-xs animate-in fade-in duration-200"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Campaign *' : 'Campanha Vinculada *'}
                      </label>
                      <select
                        value={selectedCampId}
                        onChange={(e) => setSelectedCampId(e.target.value)}
                        required
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] cursor-pointer"
                      >
                        <option value="">Selecione uma campanha</option>
                        {campaigns.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} (◎ {c.creditsPerWithdrawal})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Coupon Code (Optional)' : 'Código do Cupom (Opcional)'}
                      </label>
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Ex: PROMO-ORB-2026 (ou deixe vazio)"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] uppercase outline-none focus:border-[var(--accent)]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Max Total Redemptions' : 'Limite Total de Resgates'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={couponMaxTotal}
                        onChange={(e) => setCouponMaxTotal(Number(e.target.value))}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-xs hover:opacity-90 transition-all cursor-pointer"
                    >
                      {isEnglish ? 'Generate' : 'Gerar Cupom'}
                    </button>
                  </div>
                </form>
              )}

              {/* Coupons List */}
              <div className="space-y-3 font-mono">
                {coupons.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border)] p-8 text-center text-xs text-[var(--text-secondary)]">
                    {isEnglish ? 'No coupons created yet.' : 'Nenhum cupom gerado até o momento.'}
                  </div>
                ) : (
                  coupons.map((c) => (
                    <div
                      key={c.code}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50 transition-colors"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--foreground)] tracking-wider">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.code, 'Código')}
                            title="Copiar código"
                            className="text-[var(--text-tertiary)] hover:text-[var(--foreground)] p-1 transition-colors cursor-pointer"
                          >
                            <Copy size={13} />
                          </button>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              c.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <div className="text-xs text-[var(--text-secondary)]">
                          Campanha: <span className="text-[var(--foreground)]">{c.campaign?.title || c.campaignId}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                          <span>
                            Resgates: {c.timesRedeemed} / {c.maxTotalRedemptions}
                          </span>
                          <span>·</span>
                          <span>QR Token: <code className="text-[10px] text-[var(--foreground)]">{c.qrReference}</code></span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.qrReference, 'QR Token')}
                            title="Copiar Token QR"
                            className="text-[var(--text-tertiary)] hover:text-[var(--foreground)] p-0.5 cursor-pointer"
                          >
                            <Copy size={11} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCouponStatus(c.code, c.status)}
                          className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                        >
                          {c.status === 'active' ? (isEnglish ? 'Disable' : 'Desativar') : (isEnglish ? 'Activate' : 'Ativar')}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DISTRIBUTION */}
          {activeTab === 'distribution' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] font-mono">
                  {isEnglish ? 'Coupon Distribution Engine' : 'Motor de Distribuição de Cupons'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isEnglish
                    ? 'Deliver promotional coupons to all registered users or targeted accounts with optional in-app notification dispatch.'
                    : 'Distribua cupons para todos os usuários cadastrados ou contas selecionadas com disparo automático de notificação in-app.'}
                </p>
              </div>

              <form
                onSubmit={handleDistribute}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4 font-mono text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                      {isEnglish ? 'Select Coupon *' : 'Selecione o Cupom *'}
                    </label>
                    <select
                      value={distCouponCode}
                      onChange={(e) => setDistCouponCode(e.target.value)}
                      required
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] cursor-pointer"
                    >
                      <option value="">Selecione um cupom</option>
                      {coupons.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} (Status: {c.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                      {isEnglish ? 'Target Audience' : 'Público Alvo'}
                    </label>
                    <div className="flex items-center gap-4 py-2">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="distTarget"
                          checked={distTargetType === 'all'}
                          onChange={() => setDistTargetType('all')}
                          className="accent-[var(--accent)]"
                        />
                        <span>{isEnglish ? 'All Users (Broadcast)' : 'Todos os Usuários'}</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="distTarget"
                          checked={distTargetType === 'specific'}
                          onChange={() => setDistTargetType('specific')}
                          className="accent-[var(--accent)]"
                        />
                        <span>{isEnglish ? 'Specific User' : 'Usuário Específico'}</span>
                      </label>
                    </div>
                  </div>

                  {distTargetType === 'specific' && (
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                        {isEnglish ? 'Select or Enter User UID *' : 'Selecione ou Informe o UID do Usuário *'}
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={distTargetUid}
                          onChange={(e) => setDistTargetUid(e.target.value)}
                          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] cursor-pointer"
                        >
                          <option value="">Selecione da lista de usuários</option>
                          {users.map((u) => (
                            <option key={u.uid} value={u.uid}>
                              {u.email || u.uid} ({u.role})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={distTargetUid}
                          onChange={(e) => setDistTargetUid(e.target.value)}
                          placeholder="Ou digite o UID direto"
                          className="w-1/3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer pb-2">
                      <input
                        type="checkbox"
                        checked={distSendNotification}
                        onChange={(e) => setDistSendNotification(e.target.checked)}
                        className="accent-[var(--accent)] rounded"
                      />
                      <span className="font-bold text-[11px] text-[var(--foreground)]">
                        {isEnglish ? 'Send In-App Push Notification' : 'Disparar Notificação In-App ao Usuário'}
                      </span>
                    </label>

                    {distSendNotification && (
                      <input
                        type="text"
                        value={distCustomMessage}
                        onChange={(e) => setDistCustomMessage(e.target.value)}
                        placeholder="Mensagem personalizada da notificação (opcional)"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                      />
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    <Send size={14} />
                    <span>{isEnglish ? 'Execute Distribution' : 'Distribuir Cupom'}</span>
                  </button>
                </div>
              </form>

              {/* Distribution History */}
              <div className="space-y-3 font-mono">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {isEnglish ? 'Distribution History' : 'Histórico de Distribuições'}
                </h4>
                {distributions.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border)] p-6 text-center text-xs text-[var(--text-secondary)]">
                    {isEnglish ? 'No distributions recorded.' : 'Nenhuma distribuição registrada.'}
                  </div>
                ) : (
                  distributions.map((d) => (
                    <div
                      key={d.id}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--foreground)]">
                          Cupom: <span className="text-[var(--accent)]">{d.couponCode}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">
                          {new Date(d.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)]">
                        <span>Destinatários: {d.targetCount} usuário(s)</span>
                        <span>·</span>
                        <span>Notificação: {d.notificationSent ? 'Sim' : 'Não'}</span>
                        <span>·</span>
                        <span>Admin: {d.adminUid.slice(0, 10)}...</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NOTIFICATIONS & COMMUNICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[var(--foreground)] font-mono">
                  {isEnglish ? 'Notification & Communications Central' : 'Central de Notificações & Comunicação'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  {isEnglish
                    ? 'Dispatch notifications, announcements and alerts directly to users.'
                    : 'Despache notificações, comunicados e alertas diretamente para as contas dos usuários.'}
                </p>
              </div>

              {/* Dispatch Form */}
              <form
                onSubmit={handleSendNotification}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4 font-mono text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                      {isEnglish ? 'Notification Title *' : 'Título da Notificação *'}
                    </label>
                    <input
                      type="text"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="Ex: Novo alinhamento planetário disponível"
                      required
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                      {isEnglish ? 'Notification Body Content *' : 'Conteúdo da Mensagem *'}
                    </label>
                    <textarea
                      rows={3}
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      placeholder="Ex: Acesse seu Daily Journal para sincronizar seus insights astrológicos e neuroacústicos de hoje."
                      required
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                      {isEnglish ? 'Destination' : 'Destino'}
                    </label>
                    <div className="flex items-center gap-4 py-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="notifTarget"
                          checked={notifTargetType === 'all'}
                          onChange={() => setNotifTargetType('all')}
                          className="accent-[var(--accent)]"
                        />
                        <span>{isEnglish ? 'Broadcast to All Registered Users' : 'Transmitir para Todos os Usuários'}</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="notifTarget"
                          checked={notifTargetType === 'specific'}
                          onChange={() => setNotifTargetType('specific')}
                          className="accent-[var(--accent)]"
                        />
                        <span>{isEnglish ? 'Targeted User' : 'Usuário Específico'}</span>
                      </label>
                    </div>
                  </div>

                  {notifTargetType === 'specific' && (
                    <div className="sm:col-span-2">
                      <select
                        value={notifTargetUid}
                        onChange={(e) => setNotifTargetUid(e.target.value)}
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] cursor-pointer"
                      >
                        <option value="">Selecione o usuário</option>
                        {users.map((u) => (
                          <option key={u.uid} value={u.uid}>
                            {u.email || u.uid}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-sm"
                  >
                    <Send size={14} />
                    <span>{isEnglish ? 'Send Notification' : 'Enviar Notificação'}</span>
                  </button>
                </div>
              </form>

              {/* Notification Stream */}
              <div className="space-y-3 font-mono">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {isEnglish ? 'Sent Notifications Log' : 'Log de Notificações Enviadas'}
                </h4>
                {notifications.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border)] p-6 text-center text-xs text-[var(--text-secondary)]">
                    {isEnglish ? 'No notifications sent yet.' : 'Nenhuma notificação enviada ainda.'}
                  </div>
                ) : (
                  notifications.slice(0, 20).map((n) => (
                    <div
                      key={n.id}
                      className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[var(--foreground)]">{n.title}</span>
                        <span className="text-[10px] text-[var(--text-tertiary)]">
                          {new Date(n.sentAt || n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)]">{n.body}</p>
                      <div className="text-[10px] text-[var(--text-tertiary)] pt-0.5">
                        Canal: {n.channel} · Destinatário: {n.ownerUid?.slice(0, 12)}...
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT, VERSIONS & REDEMPTIONS (Fase 4F) */}
          {activeTab === 'audit' && (
            <AdminCommercialAuditTab
              commercialVersions={commercialVersions}
              redemptions={redemptions}
              auditLogs={auditLogs}
              showToast={showToast}
              isEnglish={isEnglish}
              onRefresh={loadData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
