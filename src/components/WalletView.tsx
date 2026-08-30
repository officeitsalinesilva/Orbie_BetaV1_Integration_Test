import React, { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Crown,
  Check,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Copy,
  Plus,
  Minus,
  QrCode,
} from 'lucide-react';
import { OrbBrand } from './OrbBrand';
import { GoogleProfileAvatar } from './common/GoogleProfileAvatar';
import { SystemSlideDrawer } from './common/SystemSlideDrawer';
import { AppFooter } from './common/AppFooter';
import { TermsSupportModal } from './TermsSupportModal';
import { CouponQrScannerModal } from './wallet/CouponQrScannerModal';
import { MercadoPagoCheckoutModal } from './wallet/MercadoPagoCheckoutModal';
import { useOrb } from '../context/OrbContext';
import { useGeoPricing } from '../hooks/useGeoPricing';

type Props = {
  onBack: () => void;
  onOpenProfile?: () => void;
  onOpenCatalog?: () => void;
  onOpenDailyJournal?: () => void;
  onOpenNeuroacustica?: () => void;
  onOpenChat?: () => void;
  onOpenNotifications?: () => void;
  onSignOut?: () => void;
};

// Valores disponíveis para a seleção via stepper (+ e -)
const RECHARGE_VALUES = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100];

export function WalletView({
  onBack,
  onOpenProfile,
  onOpenCatalog,
  onOpenDailyJournal,
  onOpenNeuroacustica,
  onOpenChat,
  onOpenNotifications,
  onSignOut,
}: Props) {
  const { profile, preferences, credits, spendCredits, userPlan, upgradeToPlan } = useOrb();
  const [toastMessage, setToastMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [termsModalType, setTermsModalType] = useState<'terms' | 'privacy' | 'support' | null>(null);

  // Modal de escaneamento de Cupom QR Code
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Regional Pricing Hook (detecção local)
  const {
    currentCountry,
    calculate,
  } = useGeoPricing(profile?.currentCountry || profile?.birthCountry || 'Brasil');

  // Índice selecionado na lista de valores de recarga (começa em 50, que é índice 9)
  const [rechargeIndex, setRechargeIndex] = useState<number>(() => {
    const idx = RECHARGE_VALUES.indexOf(50);
    return idx >= 0 ? idx : 0;
  });

  const selectedRechargeAmount = RECHARGE_VALUES[rechargeIndex] || 50;

  // Mercado Pago checkout state
  const [isMercadoPagoModalOpen, setIsMercadoPagoModalOpen] = useState(false);
  const [selectedRechargeCredits, setSelectedRechargeCredits] = useState<number>(50);
  const [isPlanCheckout, setIsPlanCheckout] = useState<boolean>(false);

  const isEnglish = preferences.language === 'en';
  const name = profile?.preferredName || profile?.fullName?.split(' ')[0] || 'Aline';

  const inviteCode = `${name.toUpperCase().replace(/\s+/g, '')}-7X9K`;
  const inviteLink = `https://orb.app/invite/${inviteCode}`;

  const handleDecrease = () => {
    setRechargeIndex((prev) => Math.max(0, prev - 1));
  };

  const handleIncrease = () => {
    setRechargeIndex((prev) => Math.min(RECHARGE_VALUES.length - 1, prev + 1));
  };

  const handleOpenRecharge = (creditsAmount: number) => {
    setSelectedRechargeCredits(creditsAmount);
    setIsPlanCheckout(false);
    setIsMercadoPagoModalOpen(true);
  };

  const handleOpenPlanUpgrade = () => {
    setSelectedRechargeCredits(50);
    setIsPlanCheckout(true);
    setIsMercadoPagoModalOpen(true);
  };

  const handlePaymentCompleted = (creditsAdded: number, transactionId: string, isPlan?: boolean) => {
    if (isPlan) {
      upgradeToPlan('premium', creditsAdded);
      setToastMessage(
        isEnglish
          ? `Subscription Plan activated! +${creditsAdded} credits added to your wallet (ID: ${transactionId.slice(0, 10)}).`
          : `Plano Assinatura ativado! +${creditsAdded} créditos creditados na sua carteira (ID: ${transactionId.slice(0, 10)}).`
      );
    } else {
      spendCredits(-creditsAdded);
      setToastMessage(
        isEnglish
          ? `Payment approved! +${creditsAdded} credits added to your wallet (ID: ${transactionId.slice(0, 10)}).`
          : `Pagamento aprovado! +${creditsAdded} créditos creditados na sua carteira.`
      );
    }
    setTimeout(() => setToastMessage(''), 4500);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setToastMessage(
      isEnglish
        ? 'Invite link copied to clipboard!'
        : 'Link de convite copiado para a área de transferência!'
    );
    setTimeout(() => {
      setCopiedLink(false);
      setToastMessage('');
    }, 3000);
  };

  const isUserPremium = userPlan === 'premium';
  const planPriceCalculated = calculate(50);
  const planPriceFormatted = planPriceCalculated.formattedAmount;
  const selectedRechargeCalc = calculate(selectedRechargeAmount);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--accent)]/20 flex flex-col pb-8">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR PADRÃO                                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-lg px-6 py-3 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between relative">
          {/* Esquerda: Logo OrbBrand Oficial */}
          <div className="flex items-center">
            <OrbBrand compact />
          </div>

          {/* Eixo Central da Navbar: Ícone de Carteira limpo */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none text-[var(--foreground)]">
            <CreditCard size={20} strokeWidth={1.75} />
          </div>

          {/* Direita: Foto do Usuário (Abre Menu Slide) */}
          <div className="flex items-center gap-2">
            <GoogleProfileAvatar
              profile={profile}
              name={name}
              onClick={() => setMenuOpen(true)}
              title={isEnglish ? 'Open system menu' : 'Abrir menu lateral'}
            />
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SUB-HEADER: Seta de Retorno à esquerda                                 */}
      {/* ========================================================================= */}
      <div className="w-full px-6 py-2 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            aria-label={isEnglish ? 'Go back' : 'Voltar'}
            title={isEnglish ? 'Go back' : 'Voltar'}
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors p-1 -ml-1 cursor-pointer active:scale-95 flex items-center shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CONTEÚDO PRINCIPAL DA CARTEIRA (Layout Limpo, Organizado e Sem Bordas) */}
      {/* ========================================================================= */}
      <main className="mx-auto w-full max-w-3xl px-6 pt-2 space-y-8 flex-1">
        
        {/* SESSÃO 1: SALDO E COTA DIÁRIA (Plano Atual / Vigente) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[var(--text-secondary)] uppercase">
              ORB / {isEnglish ? 'WALLET' : 'CARTEIRA'}
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${
              isUserPremium ? 'text-amber-400' : 'text-[var(--text-secondary)]'
            }`}>
              <ShieldCheck size={14} />
              {isUserPremium
                ? (isEnglish ? 'Subscription Plan Active' : 'Plano Assinatura Ativo')
                : (isEnglish ? 'Free Plan' : 'Plano Gratuito')}
            </span>
          </div>

          <div className="flex items-baseline justify-center sm:justify-start gap-3 py-1">
            <span className="font-mono text-5xl sm:text-6xl font-extrabold tracking-tight text-[var(--foreground)]">
              ◎ {credits}
            </span>
            <span className="text-xs font-mono text-[var(--text-tertiary)]">
              {isEnglish ? 'credits balance' : 'créditos disponíveis'}
            </span>
          </div>

          <div className="divide-y divide-[var(--border)] text-xs font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-1">
              <span className="text-[var(--text-secondary)]">
                {isEnglish ? 'Daily Quota Allowance' : 'Cota Diária de Renovação'}
              </span>
              <span className="text-[var(--foreground)] font-semibold text-right sm:text-left">
                {isEnglish
                  ? '5 credits from platform + 5 credits from daily check-in (up to 10/day)'
                  : '5 créditos da plataforma + 5 créditos do check-in diário (até 10/dia)'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[var(--text-secondary)]">
                {isEnglish ? 'Current Plan' : 'Plano Atual'}
              </span>
              <span className="font-bold text-[var(--accent)]">
                {isUserPremium
                  ? (isEnglish ? 'Subscription Plan (Biweekly)' : 'Plano Assinatura (Quinzenal)')
                  : (isEnglish ? 'Free Plan' : 'Plano Gratuito')}
              </span>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-[var(--border)]" />

        {/* SESSÃO 2: PLANOS (GRATUITO VS ASSINATURA QUINZENAL) - LOGO APÓS O PLANO VIGENTE */}
        <section className="space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                {isEnglish ? 'SUBSCRIPTION PLANS' : 'PLANOS'}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PLANO GRATUITO */}
            <div className="p-4 space-y-3 rounded-xl bg-[var(--surface-2)] flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {isEnglish ? 'Free Plan' : 'Plano Gratuito'}
                  </span>
                  {!isUserPremium && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--surface)] text-[10px] font-semibold text-[var(--text-secondary)]">
                      {isEnglish ? 'Current Plan' : 'Plano Atual'}
                    </span>
                  )}
                </div>

                <div className="text-2xl font-extrabold text-[var(--foreground)]">
                  {currentCountry.currency.symbol} 0,00
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs">
                  <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEnglish
                        ? '5 daily credits provided by the platform'
                        : '5 créditos diários fornecidos pela plataforma'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEnglish
                        ? '+5 daily credits via check-in system (if maintained)'
                        : '+5 créditos diários pelo check-in diário (se cumprido e mantido)'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEnglish
                        ? 'Access to standard platform features'
                        : 'Acesso às ferramentas essenciais da plataforma'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                {!isUserPremium ? (
                  <div className="w-full py-2 text-center text-xs font-bold text-[var(--text-secondary)]">
                    {isEnglish ? 'Active Free Plan' : 'Plano Gratuito Ativo'}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => upgradeToPlan('free', 0)}
                    className="w-full py-2 text-center rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] text-xs font-semibold text-[var(--text-secondary)] transition-colors cursor-pointer"
                  >
                    {isEnglish ? 'Switch to Free' : 'Mudar para Gratuito'}
                  </button>
                )}
              </div>
            </div>

            {/* PLANO ASSINATURA (QUINZENAL) */}
            <div className="p-4 space-y-3 rounded-xl bg-linear-to-b from-[#009EE3]/10 to-[var(--surface-2)] flex flex-col justify-between relative">
              <span className="absolute top-3 right-3 rounded-full bg-linear-to-r from-amber-500 to-amber-600 px-2.5 py-0.5 text-[9px] font-extrabold text-black uppercase tracking-wider">
                {isEnglish ? 'Biweekly' : 'Quinzenal'}
              </span>

              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Crown size={15} className="text-amber-400" />
                  <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                    {isEnglish ? 'Subscription Plan' : 'Plano Assinatura'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-[#009EE3]">
                    {planPriceFormatted}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    / {isEnglish ? '15 days' : '15 dias'}
                  </span>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs">
                  <div className="flex items-start gap-2 text-[var(--foreground)] font-semibold">
                    <Sparkles size={14} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      {isEnglish
                        ? '+50 instant credits delivered to wallet'
                        : '+50 créditos na carteira a cada quinzena'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEnglish
                        ? 'Unlock exclusive panels & tools across the platform'
                        : 'Desbloqueio de painéis exclusivos e ferramentas na plataforma'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-[var(--text-secondary)]">
                    <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>
                      {isEnglish
                        ? '5 daily credits + 5 daily check-in credits maintained'
                        : '5 créditos diários da plataforma + 5 créditos pelo check-in diário mantido'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenPlanUpgrade}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#009EE3] hover:bg-[#0081b8] text-white text-xs font-bold transition-all active:scale-98 cursor-pointer shadow-md"
                >
                  <Crown size={14} />
                  <span>
                    {isUserPremium
                      ? (isEnglish ? `Renew Biweekly Plan (${planPriceFormatted})` : `Renovar Plano Assinatura (${planPriceFormatted})`)
                      : (isEnglish ? `Subscribe Biweekly (${planPriceFormatted})` : `Assinar Plano Quinzenal (${planPriceFormatted})`)}
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="h-px w-full bg-[var(--border)]" />

        {/* SESSÃO 3: RECARGA DE CRÉDITOS (+ e - STEPPER + ÍCONE DETECÇÃO BRL) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent)]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
                {isEnglish ? 'RECHARGE CREDITS' : 'RECARGA DE CRÉDITOS'}
              </h2>
            </div>

            {/* Ícone de Detecção Local BRL */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-2)] text-[11px] font-mono font-semibold text-[var(--text-secondary)]">
              <span>{currentCountry.currency.flag}</span>
              <span className="text-[var(--foreground)] font-bold">{currentCountry.currency.code}</span>
              <span>({currentCountry.currency.symbol})</span>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {/* STEPPER COM SÍMBOLOS DE - E + */}
            <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--surface-2)]">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={rechargeIndex === 0}
                aria-label={isEnglish ? 'Decrease credits' : 'Diminuir créditos'}
                className="flex items-center justify-center w-11 h-11 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] disabled:opacity-30 disabled:pointer-events-none text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
              >
                <Minus size={18} />
              </button>

              <div className="flex flex-col items-center justify-center">
                <span className="font-mono text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
                  ◎ {selectedRechargeAmount}
                </span>
                <span className="text-xs font-mono font-semibold text-[var(--accent)]">
                  {selectedRechargeCalc.formattedAmount}
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={rechargeIndex === RECHARGE_VALUES.length - 1}
                aria-label={isEnglish ? 'Increase credits' : 'Aumentar créditos'}
                className="flex items-center justify-center w-11 h-11 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)] disabled:opacity-30 disabled:pointer-events-none text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* QUANDO ESCOLHER 50: OPÇÃO EXPLÍCITA PARA ASSINATURA AO INVÉS DE APENAS RECARGA */}
            {selectedRechargeAmount === 50 ? (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 space-y-3 font-mono animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Crown size={15} />
                  <span>
                    {isEnglish
                      ? '50 Credits Selected (Same Price: Subscription Plan Option Available)'
                      : '50 Créditos Selecionados — Mesmo Valor: Opte pelo Plano Assinatura!'}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isEnglish
                    ? `By choosing the Subscription Plan for ${selectedRechargeCalc.formattedAmount}, you receive the 50 credits PLUS exclusive platform panels and tools unlocked.`
                    : `Pelo mesmo valor de ${selectedRechargeCalc.formattedAmount}, ao assinar o Plano Assinatura você recebe os 50 créditos na hora E MAIS o desbloqueio de ferramentas e painéis exclusivos na plataforma.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleOpenPlanUpgrade}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold transition-all active:scale-98 cursor-pointer shadow-sm"
                  >
                    <Crown size={14} />
                    <span>{isEnglish ? 'Choose Subscription Plan' : 'Optar pelo Plano Assinatura'}</span>
                    <ArrowUpRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenRecharge(50)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--foreground)] text-xs font-semibold transition-all active:scale-98 cursor-pointer"
                  >
                    <span>{isEnglish ? 'Only 50 One-Time Credits' : 'Apenas Recarga de 50 Créditos'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Action Bar normal para os outros valores */
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    {isEnglish ? 'Total:' : 'Total a pagar:'}
                  </span>
                  <span className="text-xl font-mono font-extrabold text-[#009EE3]">
                    {selectedRechargeCalc.formattedAmount}
                  </span>
                  <span className="text-xs font-mono text-[var(--text-tertiary)]">
                    (◎ {selectedRechargeAmount} {isEnglish ? 'credits' : 'créditos'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenRecharge(selectedRechargeAmount)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#009EE3] hover:bg-[#0081b8] text-white font-mono text-xs font-bold transition-all active:scale-98 cursor-pointer shadow-md"
                >
                  <CreditCard size={14} />
                  <span>
                    {isEnglish
                      ? `Recharge ◎ ${selectedRechargeAmount} (${selectedRechargeCalc.formattedAmount})`
                      : `Recarregar ◎ ${selectedRechargeAmount} (${selectedRechargeCalc.formattedAmount})`}
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            )}
          </div>
        </section>

        <div className="h-px w-full bg-[var(--border)]" />

        {/* SESSÃO 4: BLOCO DE DETECÇÃO / LEITURA DE CUPONS POR QR CODE */}
        <section className="space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode size={16} className="text-[var(--accent)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                {isEnglish ? 'COUPONS & QR CODE' : 'CUPONS & LEITURA QR CODE'}
              </h2>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--surface-2)]">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[var(--foreground)] block">
                {isEnglish ? 'Have a promotion QR Code or coupon?' : 'Possui um cupom ou QR Code promocional?'}
              </span>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {isEnglish
                  ? 'Scan coupon codes with your camera or enter valid promotion keys.'
                  : 'Escaneie QR Codes com sua câmera ou ative chaves promocionais vigentes.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold hover:opacity-90 transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              <QrCode size={15} />
              <span>{isEnglish ? 'Scan QR Code' : 'Escanear QR Code'}</span>
            </button>
          </div>
        </section>

        <div className="h-px w-full bg-[var(--border)]" />

        {/* SESSÃO 5: INDIQUE AMIGOS (ABAIXO DA LEITURA DE CUPONS COM REGRAS CLARAS DE RECOMPENSA) */}
        <section className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="font-bold text-sm text-[var(--foreground)]">
                {isEnglish ? 'Invite Friends & Earn Credits' : 'Indique Amigos e Ganhe Créditos'}
              </h2>
              <div className="space-y-1 text-[11px] text-[var(--text-secondary)] leading-relaxed">
                <p>
                  • {isEnglish 
                      ? 'Earn +5 credits for each friend who signs up using your link.' 
                      : 'Ganhe +5 créditos na carteira por cada amigo que se cadastrar com o seu link.'}
                </p>
                <p>
                  • {isEnglish
                      ? 'Earn an extra +5 credits when your invited friend makes their first recharge or purchase.'
                      : 'Ganhe mais +5 créditos extras caso esse amigo realize a primeira compra na plataforma!'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <input
              type="text"
              readOnly
              value={inviteLink}
              className="w-full sm:flex-1 bg-[var(--surface-2)] px-3 py-2.5 rounded-lg text-xs text-[var(--foreground)] outline-none select-all font-mono"
            />
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                copiedLink
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90'
              }`}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? (isEnglish ? 'Copied' : 'Copiado') : (isEnglish ? 'Copy Link' : 'Copiar Link')}</span>
            </button>
          </div>
        </section>

        {/* Toast feedback */}
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--accent-foreground)] shadow-lg animate-in fade-in slide-in-from-bottom-2">
            <Check size={15} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Global Footer */}
        <AppFooter
          isEnglish={isEnglish}
          onOpenTerms={() => setTermsModalType('terms')}
          onOpenPrivacy={() => setTermsModalType('privacy')}
          onOpenSupport={() => setTermsModalType('support')}
          className="pt-6"
        />
      </main>

      {/* Coupon QR Code Scanner Modal */}
      <CouponQrScannerModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        isEnglish={isEnglish}
      />

      {/* Mercado Pago Checkout Modal */}
      <MercadoPagoCheckoutModal
        isOpen={isMercadoPagoModalOpen}
        onClose={() => setIsMercadoPagoModalOpen(false)}
        credits={selectedRechargeCredits}
        country={currentCountry.countryCode}
        userEmail={profile?.email || 'alinealv.silv@gmail.com'}
        userName={profile?.fullName || profile?.preferredName || 'Aline Silva'}
        onPaymentSuccess={handlePaymentCompleted}
        isPlanSubscription={isPlanCheckout}
        planTitle={isPlanCheckout ? (isEnglish ? 'Subscription Plan' : 'Plano Assinatura') : undefined}
        isEnglish={isEnglish}
      />

      {/* ========================================================================= */}
      {/* 4. SYSTEM SLIDE DRAWER                                                    */}
      {/* ========================================================================= */}
      <SystemSlideDrawer
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpenProfile={onOpenProfile || (() => {})}
        onOpenWallet={() => setMenuOpen(false)}
        onOpenNotifications={onOpenNotifications || (() => {})}
        onOpenDailyJournal={onOpenDailyJournal}
        onOpenNeuroacustica={onOpenNeuroacustica}
        onOpenCatalog={onOpenCatalog}
        onOpenChat={onOpenChat}
        activeScreen="wallet"
        onSignOut={onSignOut || (() => {})}
        isEnglish={isEnglish}
      />

      {/* Terms & Support Modal */}
      {termsModalType && (
        <TermsSupportModal
          type={termsModalType}
          onClose={() => setTermsModalType(null)}
          isEnglish={isEnglish}
        />
      )}
    </div>
  );
}
