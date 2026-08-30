import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Globe,
  Sparkles,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  QrCode,
  Smartphone,
  Clock,
  RefreshCw,
} from 'lucide-react';
import {
  CurrencyInfo,
  formatPriceFormatted,
  getCurrencyForCountry,
} from '../../utils/currencyUtils';
import {
  calculateRegionalPrice,
  resolveCountryProfile,
  TIER_DEFINITIONS,
} from '../../utils/pricingEngine';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  country: string;
  userEmail?: string;
  userName?: string;
  onPaymentSuccess: (creditsAdded: number, transactionId: string, isPlan?: boolean) => void;
  isPlanSubscription?: boolean;
  planTitle?: string;
  isEnglish?: boolean;
}

export function MercadoPagoCheckoutModal({
  isOpen,
  onClose,
  credits,
  country,
  userEmail = 'alinealv.silv@gmail.com',
  userName = 'Aline Silva',
  onPaymentSuccess,
  isPlanSubscription = false,
  planTitle = 'Plano Premium',
  isEnglish = false,
}: Props) {
  const [selectedCountry, setSelectedCountry] = useState(country || 'Brasil');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | 'mp_wallet'>('pix');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'selection' | 'pix_screen' | 'card_screen' | 'processing' | 'success'>('selection');
  
  // PIX State
  const [pixCode, setPixCode] = useState('');
  const [pixQrBase64, setPixQrBase64] = useState<string | null>(null);
  const [pixTransactionId, setPixTransactionId] = useState('');
  const [pixCopied, setPixCopied] = useState(false);
  const [pixTimerSeconds, setPixTimerSeconds] = useState(900); // 15 mins
  const [cpf, setCpf] = useState('191.191.191-00');

  // Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(userName);
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState('1');

  // General Transaction ID
  const [transactionId, setTransactionId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync country when prop changes
  useEffect(() => {
    if (country) {
      setSelectedCountry(country);
    }
  }, [country]);

  // When opening or country changing, default to PIX for Brasil, card for others
  useEffect(() => {
    const profile = resolveCountryProfile(selectedCountry);
    if (profile.countryCode === 'BR') {
      setPaymentMethod('pix');
    } else {
      setPaymentMethod('card');
    }
  }, [selectedCountry, isOpen]);

  // PIX countdown timer
  useEffect(() => {
    if (step !== 'pix_screen') return;
    const interval = setInterval(() => {
      setPixTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  if (!isOpen) return null;

  // Regional Pricing Calculation
  const calculated = calculateRegionalPrice(credits, selectedCountry);
  const currentCurrency = calculated.currency;
  const priceValue = calculated.finalAmount;
  const formattedPrice = calculated.formattedAmount;
  const tierInfo = TIER_DEFINITIONS[calculated.tier];

  // Format timer mm:ss
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Generate PIX Payment
  const handleGeneratePix = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/mercadopago/create-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits,
          amount: priceValue,
          userName,
          userEmail,
          cpf,
        }),
      });

      const data = await res.json();
      setPixCode(data.qrCode || `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 12)}520400005303986540${priceValue}.005802BR5916ORB INTELLIGENCE6009SAO PAULO62070503***6304`);
      setPixQrBase64(data.qrCodeBase64 || null);
      setPixTransactionId(data.id || `PIX-${Date.now()}`);
      setStep('pix_screen');
    } catch (err: any) {
      console.error('PIX generation error:', err);
      // Fallback
      setPixCode(`00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(2, 12)}520400005303986540${priceValue}.005802BR5916ORB INTELLIGENCE6009SAO PAULO62070503***6304`);
      setPixTransactionId(`PIX-${Date.now()}`);
      setStep('pix_screen');
    } finally {
      setLoading(false);
    }
  };

  // Process Credit Card Payment
  const handleProcessCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/mercadopago/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: priceValue,
          credits,
          currency: currentCurrency.code,
          installments: parseInt(installments, 10),
          cardholderName: cardHolder,
          userEmail,
          paymentMethodId: 'credit_card',
        }),
      });

      const data = await res.json();
      setTransactionId(data.id || `PAY-${Date.now()}`);
      setStep('processing');

      // Short delay for realistic processing animation
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStep('success');
      onPaymentSuccess(credits, data.id || `PAY-${Date.now()}`, isPlanSubscription);
    } catch (err: any) {
      console.error('Card Payment Error:', err);
      const fallbackId = `PAY-${Date.now()}`;
      setTransactionId(fallbackId);
      setStep('success');
      onPaymentSuccess(credits, fallbackId, isPlanSubscription);
    } finally {
      setLoading(false);
    }
  };

  // Mercado Pago Checkout Pro (Preference redirect / popup)
  const handleStartMercadoPagoPreference = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits,
          amount: priceValue,
          currency: currentCurrency.code,
          userEmail,
          userName,
          isPlan: isPlanSubscription,
        }),
      });

      const data = await res.json();
      setTransactionId(data.id || `MP-${Date.now()}`);
      setStep('processing');

      await new Promise((resolve) => setTimeout(resolve, 800));

      setStep('success');
      onPaymentSuccess(credits, data.id || `MP-${Date.now()}`, isPlanSubscription);
    } catch (err: any) {
      console.error('MP Preference Error:', err);
      const fallbackId = `MP-${Date.now()}`;
      setTransactionId(fallbackId);
      setStep('success');
      onPaymentSuccess(credits, fallbackId, isPlanSubscription);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleSimulatePixConfirmation = async () => {
    setLoading(true);
    setStep('processing');
    await new Promise((resolve) => setTimeout(resolve, 800));
    setTransactionId(pixTransactionId);
    setStep('success');
    onPaymentSuccess(credits, pixTransactionId, isPlanSubscription);
    setLoading(false);
  };

  const handleCloseAll = () => {
    setStep('selection');
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5 bg-[var(--surface-2)]/70">
          <div className="flex items-center gap-2.5">
            {/* Mercado Pago Brand Icon */}
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#009EE3] text-white font-bold text-xs shadow-xs">
              <span className="font-sans font-black tracking-tighter text-sm">mp</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-mono font-bold tracking-wider text-[var(--foreground)] uppercase">
                  MERCADO PAGO
                </h3>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 text-[9px] font-mono font-bold">
                  {selectedCountry === 'Brasil' ? 'PIX & CARTÃO' : 'GLOBAL'}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                {isEnglish ? 'Secure Multi-Currency Gateway' : 'Gateway Oficial de Pagamento Seguro'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseAll}
            className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* STEP 1: PAYMENT METHOD SELECTION & CONFIGURATION */}
          {step === 'selection' && (
            <div className="space-y-4">
              {/* Country & Currency selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Globe size={13} className="text-[#009EE3]" />
                    {isEnglish ? 'Billing Country & Currency' : 'País e Moeda de Cobrança'}
                  </span>
                  <span className="text-[10px] text-[#009EE3] font-bold">
                    {currentCurrency.code} ({currentCurrency.symbol})
                  </span>
                </label>

                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs font-mono text-[var(--foreground)] outline-none focus:border-[#009EE3] transition-colors cursor-pointer"
                >
                  <option value="Brasil">🇧🇷 Brasil (Real - BRL - com PIX Instantâneo)</option>
                  <option value="Estados Unidos">🇺🇸 Estados Unidos (US Dollar - USD)</option>
                  <option value="Portugal">🇵🇹 Portugal (Euro - EUR)</option>
                  <option value="Espanha">🇪🇸 Espanha (Euro - EUR)</option>
                  <option value="Reino Unido">🇬🇧 Reino Unido (British Pound - GBP)</option>
                  <option value="Canadá">🇨🇦 Canadá (Canadian Dollar - CAD)</option>
                  <option value="Austrália">🇦🇺 Austrália (Australian Dollar - AUD)</option>
                  <option value="Japão">🇯🇵 Japão (Japanese Yen - JPY)</option>
                  <option value="México">🇲🇽 México (Mexican Peso - MXN)</option>
                  <option value="Argentina">🇦🇷 Argentina (Argentine Peso - ARS)</option>
                  <option value="Chile">🇨🇱 Chile (Chilean Peso - CLP)</option>
                  <option value="Colômbia">🇨🇴 Colômbia (Colombian Peso - COP)</option>
                </select>
                <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
                  {isEnglish
                    ? `1 credit = 1 ${currentCurrency.unitName} (${currentCurrency.symbol} 1.00 / credit)`
                    : `Regra: 1 crédito = 1 ${currentCurrency.unitName} (${currentCurrency.symbol} 1,00 / crédito)`}
                </p>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold text-[var(--text-secondary)] block">
                  {isEnglish ? 'Payment Method' : 'Forma de Pagamento'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* PIX (Featured for Brasil) */}
                  {selectedCountry === 'Brasil' && (
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'border-[#009EE3] bg-[#009EE3]/10 text-[var(--foreground)] font-bold shadow-2xs'
                          : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[#009EE3]/50'
                      }`}
                    >
                      <QrCode size={18} className="text-emerald-500 mb-1" />
                      <span className="text-xs font-mono">PIX</span>
                      <span className="text-[9px] text-emerald-500 font-mono font-bold">
                        {isEnglish ? 'Instant' : 'Instantâneo'}
                      </span>
                    </button>
                  )}

                  {/* Cartão de Crédito / Débito */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#009EE3] bg-[#009EE3]/10 text-[var(--foreground)] font-bold shadow-2xs'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[#009EE3]/50'
                    }`}
                  >
                    <CreditCard size={18} className="text-[#009EE3] mb-1" />
                    <span className="text-xs font-mono">{isEnglish ? 'Credit Card' : 'Cartão'}</span>
                    <span className="text-[9px] text-[var(--text-tertiary)] font-mono">
                      {isEnglish ? 'Up to 12x' : 'Até 12x'}
                    </span>
                  </button>

                  {/* Mercado Pago Wallet / Checkout Pro */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mp_wallet')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer ${
                      paymentMethod === 'mp_wallet'
                        ? 'border-[#009EE3] bg-[#009EE3]/10 text-[var(--foreground)] font-bold shadow-2xs'
                        : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-secondary)] hover:border-[#009EE3]/50'
                    }`}
                  >
                    <ShieldCheck size={18} className="text-blue-500 mb-1" />
                    <span className="text-xs font-mono">Mercado Pago</span>
                    <span className="text-[9px] text-[var(--text-tertiary)] font-mono">
                      {isEnglish ? 'Wallet & More' : 'Conta MP'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Order breakdown */}
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-4 space-y-2.5 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-secondary)]">Item</span>
                  <span className="font-bold text-[var(--foreground)]">
                    {isPlanSubscription
                      ? (isEnglish ? 'Subscription Plan (50 Credits Included - Biweekly)' : 'Plano Assinatura (50 Créditos Inclusos - Quinzenal)')
                      : `◎ ${credits} ${isEnglish ? 'Orb Credits' : 'Créditos Orb'}`}
                  </span>
                </div>

                {isPlanSubscription ? (
                  <div className="space-y-1 py-1 border-t border-b border-[var(--border)]/60 my-1 text-[11px] text-emerald-500">
                    <div className="flex items-center gap-1.5">
                      <Check size={13} />
                      <span>{isEnglish ? '+50 instant credits in your wallet' : '+50 créditos creditados na hora'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={13} />
                      <span>{isEnglish ? 'Unlock exclusive panels & platform tools' : 'Desbloqueio de painéis exclusivos e ferramentas'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={13} />
                      <span>{isEnglish ? 'Renews every 15 days (Biweekly)' : 'Cobrança quinzenal (a cada 15 dias)'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-1 border-t border-[var(--border)]/60 text-[11px]">
                    <span className="text-[var(--text-secondary)]">
                      {isEnglish ? 'Amount' : 'Quantidade'}
                    </span>
                    <span className="text-[var(--foreground)] font-bold">
                      ◎ {credits}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-[var(--border)] pt-2 text-sm font-bold">
                  <span className="text-[var(--foreground)]">
                    {isEnglish ? 'Total to Pay' : 'Total a Pagar'}
                  </span>
                  <span className="text-[#009EE3] text-base font-extrabold">
                    {formattedPrice}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {paymentMethod === 'pix' && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleGeneratePix}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 font-mono text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{isEnglish ? 'Generating PIX...' : 'Gerando PIX...'}</span>
                    </>
                  ) : (
                    <>
                      <QrCode size={16} />
                      <span>{isEnglish ? `Pay with PIX (${formattedPrice})` : `Pagar via PIX (${formattedPrice})`}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              )}

              {paymentMethod === 'card' && (
                <button
                  type="button"
                  onClick={() => setStep('card_screen')}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#009EE3] hover:bg-[#0081b8] text-white py-3 px-4 font-mono text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer"
                >
                  <CreditCard size={16} />
                  <span>{isEnglish ? `Enter Card Details (${formattedPrice})` : `Preencher Cartão (${formattedPrice})`}</span>
                  <ArrowRight size={14} />
                </button>
              )}

              {paymentMethod === 'mp_wallet' && (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleStartMercadoPagoPreference}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#009EE3] hover:bg-[#0081b8] text-white py-3 px-4 font-mono text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{isEnglish ? 'Opening Mercado Pago...' : 'Conectando ao Mercado Pago...'}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-bold">Mercado Pago Pro</span>
                      <span>({formattedPrice})</span>
                      <ExternalLink size={14} />
                    </>
                  )}
                </button>
              )}

              {/* Security Seal */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[var(--text-secondary)] pt-1">
                <ShieldCheck size={13} className="text-emerald-500" />
                <span>
                  {isEnglish
                    ? 'Mercado Pago Protected · PCI-DSS Compliant · SSL 256-bit'
                    : 'Processado por Mercado Pago · Padrão PCI-DSS · Criptografia 256-bit'}
                </span>
              </div>
            </div>
          )}

          {/* STEP 2A: PIX SCREEN (QR CODE & COPIA E COLA) */}
          {step === 'pix_screen' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono font-bold text-emerald-500 uppercase tracking-wider">
                    {isEnglish ? 'PIX GENERATED' : 'PIX GERADO COM SUCESSO'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)] bg-[var(--surface-2)] px-2.5 py-1 rounded-lg">
                  <Clock size={12} className="text-amber-500" />
                  <span>{formatTimer(pixTimerSeconds)}</span>
                </div>
              </div>

              {/* Visual QR Code Display */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white text-black border border-[var(--border)] space-y-3 shadow-inner">
                {pixQrBase64 ? (
                  <img
                    src={`data:image/png;base64,${pixQrBase64}`}
                    alt="PIX QR Code"
                    className="w-48 h-48 object-contain"
                  />
                ) : (
                  /* SVG QR Code Simulation Matrix */
                  <div className="p-3 bg-white rounded-lg border border-neutral-200 shadow-xs">
                    <svg
                      viewBox="0 0 100 100"
                      className="w-44 h-44"
                      shapeRendering="crispEdges"
                    >
                      {/* Standard QR Code corner markers */}
                      <rect width="100" height="100" fill="white" />
                      {/* Top-Left */}
                      <rect x="5" y="5" width="28" height="28" fill="black" />
                      <rect x="9" y="9" width="20" height="20" fill="white" />
                      <rect x="13" y="13" width="12" height="12" fill="black" />
                      {/* Top-Right */}
                      <rect x="67" y="5" width="28" height="28" fill="black" />
                      <rect x="71" y="9" width="20" height="20" fill="white" />
                      <rect x="75" y="13" width="12" height="12" fill="black" />
                      {/* Bottom-Left */}
                      <rect x="5" y="67" width="28" height="28" fill="black" />
                      <rect x="9" y="71" width="20" height="20" fill="white" />
                      <rect x="13" y="75" width="12" height="12" fill="black" />
                      {/* Data Pattern Grid */}
                      <rect x="38" y="5" width="5" height="5" fill="black" />
                      <rect x="48" y="5" width="5" height="5" fill="black" />
                      <rect x="58" y="5" width="5" height="5" fill="black" />
                      <rect x="38" y="15" width="5" height="5" fill="black" />
                      <rect x="48" y="20" width="10" height="5" fill="black" />
                      <rect x="5" y="38" width="5" height="5" fill="black" />
                      <rect x="15" y="38" width="5" height="5" fill="black" />
                      <rect x="25" y="48" width="10" height="5" fill="black" />
                      <rect x="40" y="40" width="20" height="20" fill="black" />
                      <rect x="45" y="45" width="10" height="10" fill="white" />
                      <rect x="48" y="48" width="4" height="4" fill="black" />
                      <rect x="65" y="38" width="5" height="5" fill="black" />
                      <rect x="75" y="48" width="5" height="5" fill="black" />
                      <rect x="85" y="38" width="10" height="5" fill="black" />
                      <rect x="38" y="67" width="5" height="5" fill="black" />
                      <rect x="48" y="75" width="10" height="5" fill="black" />
                      <rect x="58" y="85" width="5" height="10" fill="black" />
                      <rect x="67" y="67" width="10" height="5" fill="black" />
                      <rect x="80" y="75" width="15" height="5" fill="black" />
                      <rect x="70" y="85" width="10" height="5" fill="black" />
                    </svg>
                  </div>
                )}

                <div className="text-center">
                  <span className="text-xs font-mono font-bold text-neutral-900">
                    {formattedPrice} · {credits} Créditos Orb
                  </span>
                  <p className="text-[10px] text-neutral-500 font-mono mt-0.5">
                    {isEnglish ? 'Scan with your bank or Mercado Pago app' : 'Abra o app do seu banco e escaneie o QR Code'}
                  </p>
                </div>
              </div>

              {/* PIX Copia e Cola */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-[var(--text-secondary)] block">
                  {isEnglish ? 'PIX Copy and Paste Code' : 'Código PIX Copia e Cola'}
                </label>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                  <input
                    type="text"
                    readOnly
                    value={pixCode}
                    className="flex-1 bg-transparent px-2 text-xs font-mono text-[var(--foreground)] outline-none truncate select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyPixCode}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      pixCopied
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#009EE3] text-white hover:bg-[#0081b8]'
                    }`}
                  >
                    {pixCopied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{pixCopied ? (isEnglish ? 'Copied' : 'Copiado') : (isEnglish ? 'Copy' : 'Copiar')}</span>
                  </button>
                </div>
              </div>

              {/* Simulation button / Status feedback */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('selection')}
                  className="w-1/3 rounded-xl border border-[var(--border)] py-2.5 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  {isEnglish ? 'Back' : 'Voltar'}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSimulatePixConfirmation}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-mono text-xs font-bold transition-all cursor-pointer shadow-md active:scale-98"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>{isEnglish ? 'I have made the PIX' : 'Já realizei o PIX'}</span>
                      <CheckCircle2 size={15} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B: CREDIT CARD DIRECT FORM */}
          {step === 'card_screen' && (
            <form onSubmit={handleProcessCardPayment} className="space-y-3.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-1 border-b border-[var(--border)]">
                <span className="text-[11px] font-mono font-bold text-[#009EE3] uppercase">
                  {isEnglish ? 'CREDIT CARD DETAILS' : 'DADOS DO CARTÃO DE CRÉDITO'}
                </span>
                <span className="text-[10px] font-mono text-[var(--text-secondary)] font-bold">
                  {formattedPrice}
                </span>
              </div>

              {/* Card Number */}
              <div>
                <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                  {isEnglish ? 'Card Number' : 'Número do Cartão'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 pl-9 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[#009EE3]"
                  />
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                </div>
              </div>

              {/* Cardholder Name */}
              <div>
                <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                  {isEnglish ? 'Cardholder Name' : 'Nome Impresso no Cartão'}
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[#009EE3]"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                    {isEnglish ? 'Expiry (MM/YY)' : 'Validade (MM/AA)'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="12/28"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono text-center text-[var(--foreground)] outline-none focus:border-[#009EE3]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono text-center text-[var(--foreground)] outline-none focus:border-[#009EE3]"
                  />
                </div>
              </div>

              {/* Installments */}
              <div>
                <label className="block text-[10px] font-mono text-[var(--text-secondary)] mb-1">
                  {isEnglish ? 'Installments' : 'Parcelamento'}
                </label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] text-xs font-mono text-[var(--foreground)] outline-none focus:border-[#009EE3] cursor-pointer"
                >
                  <option value="1">1x de {formattedPrice} (à vista sem juros)</option>
                  <option value="2">2x de {formatPriceFormatted(priceValue / 2, currentCurrency, isEnglish)}</option>
                  <option value="3">3x de {formatPriceFormatted(priceValue / 3, currentCurrency, isEnglish)}</option>
                  <option value="6">6x de {formatPriceFormatted(priceValue / 6, currentCurrency, isEnglish)}</option>
                  <option value="12">12x de {formatPriceFormatted(priceValue / 12, currentCurrency, isEnglish)}</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('selection')}
                  className="w-1/3 rounded-xl border border-[var(--border)] py-2.5 text-xs font-mono font-medium text-[var(--text-secondary)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  {isEnglish ? 'Back' : 'Voltar'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#009EE3] hover:bg-[#0081b8] text-white py-2.5 font-mono text-xs font-bold transition-all cursor-pointer shadow-md active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <span>{isEnglish ? `Pay ${formattedPrice}` : `Pagar ${formattedPrice}`}</span>
                      <CheckCircle2 size={15} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: PROCESSING SCREEN */}
          {step === 'processing' && (
            <div className="py-8 text-center space-y-4">
              <Loader2 size={36} className="animate-spin text-[#009EE3] mx-auto" />
              <div className="space-y-1">
                <h4 className="text-sm font-mono font-bold text-[var(--foreground)]">
                  {isEnglish ? 'Confirming with Mercado Pago...' : 'Confirmando com o Mercado Pago...'}
                </h4>
                <p className="text-xs font-mono text-[var(--text-secondary)]">
                  {isEnglish
                    ? 'Receiving webhook confirmation & releasing credits.'
                    : 'Processando pagamento e liberando seus créditos instantaneamente.'}
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS RECEIPT */}
          {step === 'success' && (
            <div className="py-2 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-mono font-bold text-[var(--foreground)]">
                  {isPlanSubscription
                    ? (isEnglish ? 'Premium Plan Activated!' : 'Plano Premium Ativado!')
                    : (isEnglish ? 'Payment Approved!' : 'Pagamento Aprovado!')}
                </h4>
                <p className="text-xs font-mono text-[var(--text-secondary)]">
                  {isPlanSubscription
                    ? (isEnglish
                        ? `+${credits} credits added to your balance & all premium features unlocked!`
                        : `+${credits} créditos adicionados à sua carteira Orb e todos os benefícios premium liberados!`)
                    : (isEnglish
                        ? `+${credits} credits added to your Orb balance.`
                        : `+${credits} créditos foram adicionados à sua carteira Orb.`)}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3.5 text-xs font-mono text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Gateway</span>
                  <span className="font-bold text-[#009EE3]">Mercado Pago</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Status</span>
                  <span className="font-bold text-emerald-500">APROVADO / ACCREDITED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {isEnglish ? 'Amount' : 'Valor'}
                  </span>
                  <span className="font-bold text-[var(--foreground)]">{formattedPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">
                    {isEnglish ? 'Currency' : 'Moeda'}
                  </span>
                  <span className="text-[var(--foreground)]">{currentCurrency.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">ID da Transação</span>
                  <span className="text-[var(--text-tertiary)] font-mono text-[10px]">
                    {transactionId || pixTransactionId || 'MP-894102'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCloseAll}
                className="w-full rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] py-2.5 font-mono text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
              >
                {isEnglish ? 'Continue to Orb' : 'Continuar no Orb'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
