import React, { useState } from 'react';
import {
  Globe,
  Calculator,
  ShieldCheck,
  ChevronDown,
  Info,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  CountryPricingProfile,
  TierInfo,
  BASE_PRICE_USD,
} from '../../utils/pricingEngine';

interface Props {
  currentCountry: CountryPricingProfile;
  tierInfo: TierInfo;
  allCountries: CountryPricingProfile[];
  onSelectCountry: (countryCode: string) => void;
  isAutoDetected?: boolean;
  detectedIp?: string;
  isEnglish?: boolean;
}

export function RegionalPricingBanner({
  currentCountry,
  tierInfo,
  allCountries,
  onSelectCountry,
  isAutoDetected = true,
  detectedIp,
  isEnglish = false,
}: Props) {
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Group countries by Tier for clean selection
  const tier1Countries = allCountries.filter((c) => c.tier === 1);
  const tier2Countries = allCountries.filter((c) => c.tier === 2);
  const tier3Countries = allCountries.filter((c) => c.tier === 3);

  const getTierColorBadge = (tier: number) => {
    if (tier === 3) return 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400';
    if (tier === 2) return 'bg-[#009EE3]/15 border-[#009EE3]/40 text-[#009EE3]';
    return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
  };

  return (
    <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5 shadow-2xs overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[var(--accent)]/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Geo Detection Status & Country */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-secondary)]">
              <Globe size={13} className="text-[#009EE3]" />
              {isEnglish ? 'LOCATION & REGIONAL PRICING' : 'DETECÇÃO LOCAL & PRECIFICAÇÃO REGIONAL'}
            </span>

            {isAutoDetected && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-mono font-semibold text-emerald-500">
                <CheckCircle2 size={10} />
                {isEnglish ? 'IP Auto-Detected' : 'Detectado via IP'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">{currentCountry.currency.flag}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-mono font-bold text-[var(--foreground)]">
                  {isEnglish ? currentCountry.countryNameEn : currentCountry.countryNamePt}
                </h3>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold ${getTierColorBadge(
                    currentCountry.tier
                  )}`}
                >
                  {isEnglish ? `Tier ${currentCountry.tier}` : tierInfo.badge}
                </span>
              </div>
              <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                {isEnglish
                  ? `Currency: ${currentCountry.currency.name} (${currentCountry.currency.code}) · Multiplier: ${tierInfo.multiplier.toFixed(2)}x`
                  : `Moeda: ${currentCountry.currency.name} (${currentCountry.currency.code}) · Multiplicador: ${tierInfo.multiplier.toFixed(2)}x`}
                {currentCountry.countryCode === 'BR' && (
                  <span className="text-emerald-500 font-semibold ml-1">
                    ({isEnglish ? 'Fixed R$ 1.00 / credit' : 'Fixo R$ 1,00 / crédito'})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions (Change Country Selector & Formula Breakdown Modal Button) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Country Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] hover:bg-[var(--surface-3)] text-xs font-mono text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <span>{currentCountry.currency.flag}</span>
              <span className="font-semibold">
                {isEnglish ? currentCountry.countryNameEn : currentCountry.countryNamePt}
              </span>
              <ChevronDown size={13} className="text-[var(--text-secondary)]" />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-64 max-h-80 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl z-50 divide-y divide-[var(--border)]/60 text-xs font-mono">
                  {/* Tier 1 Group */}
                  <div className="py-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      Tier 1: {isEnglish ? 'Developed (1.00x)' : 'Desenvolvidos (1.00x)'}
                    </div>
                    {tier1Countries.map((c) => (
                      <button
                        key={c.countryCode}
                        type="button"
                        onClick={() => {
                          onSelectCountry(c.countryCode);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-left cursor-pointer ${
                          c.countryCode === currentCountry.countryCode ? 'bg-[var(--surface-2)] font-bold text-[#009EE3]' : 'text-[var(--foreground)]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.currency.flag}</span>
                          <span>{isEnglish ? c.countryNameEn : c.countryNamePt}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{c.currency.code}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tier 2 Group */}
                  <div className="py-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-[#009EE3] uppercase tracking-wider">
                      Tier 2: {isEnglish ? 'Middle Income (-50%)' : 'Renda Média (-50%)'}
                    </div>
                    {tier2Countries.map((c) => (
                      <button
                        key={c.countryCode}
                        type="button"
                        onClick={() => {
                          onSelectCountry(c.countryCode);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-left cursor-pointer ${
                          c.countryCode === currentCountry.countryCode ? 'bg-[var(--surface-2)] font-bold text-[#009EE3]' : 'text-[var(--foreground)]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.currency.flag}</span>
                          <span>{isEnglish ? c.countryNameEn : c.countryNamePt}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{c.currency.code}</span>
                      </button>
                    ))}
                  </div>

                  {/* Tier 3 Group */}
                  <div className="py-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      Tier 3: {isEnglish ? 'Lower Income (-70%)' : 'Acessibilidade (-70%)'}
                    </div>
                    {tier3Countries.map((c) => (
                      <button
                        key={c.countryCode}
                        type="button"
                        onClick={() => {
                          onSelectCountry(c.countryCode);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[var(--surface-2)] text-left cursor-pointer ${
                          c.countryCode === currentCountry.countryCode ? 'bg-[var(--surface-2)] font-bold text-[#009EE3]' : 'text-[var(--foreground)]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{c.currency.flag}</span>
                          <span>{isEnglish ? c.countryNameEn : c.countryNamePt}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">{c.currency.code}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Formula Transparency Button */}
          <button
            type="button"
            onClick={() => setShowFormulaModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--border)] text-xs font-mono font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <Calculator size={13} className="text-[var(--accent)]" />
            <span>{isEnglish ? 'View Formula' : 'Ver Fórmula'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* MATHEMATICAL FORMULA TRANSPARENCY MODAL                                 */}
      {/* ======================================================================= */}
      {showFormulaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#009EE3]/15 text-[#009EE3]">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-[var(--foreground)]">
                    {isEnglish ? 'Regional Parity Pricing Formula' : 'Fórmula Matemática de Precificação Regional'}
                  </h3>
                  <p className="text-[11px] font-mono text-[var(--text-secondary)]">
                    {isEnglish
                      ? 'Purchasing Power Parity (PPP) & Rounding Rules'
                      : 'Paridade de Poder de Compra (PPP) & Regras de Arredondamento'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--surface-2)] text-xs font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formula Block */}
            <div className="rounded-xl border border-[#009EE3]/30 bg-[#009EE3]/5 p-4 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#009EE3]">
                {isEnglish ? 'CORE MATHEMATICAL FORMULA' : 'FÓRMULA BASE'}
              </span>
              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] font-mono text-xs sm:text-sm font-extrabold text-[var(--foreground)] text-center">
                PreçoFinal = Quantidade × PreçoBaseUSD × MultiplicadorRegional
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-[var(--text-secondary)]">
                <div>
                  <span className="font-bold text-[var(--foreground)]">PreçoBaseUSD:</span> USD {BASE_PRICE_USD.toFixed(2)} (Matriz)
                </div>
                <div>
                  <span className="font-bold text-[var(--foreground)]">Multiplicador:</span> {tierInfo.multiplier.toFixed(2)}x (Tier {currentCountry.tier})
                </div>
                <div>
                  <span className="font-bold text-[var(--foreground)]">Desconto:</span> {tierInfo.discountPercent}% OFF
                </div>
              </div>
            </div>

            {/* Rules by Tier */}
            <div className="space-y-2.5 text-xs font-mono">
              <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                {isEnglish ? 'TIER MULTIPLIERS & ROUNDING RULES' : 'MULTIPLICADORES POR TIER & REGRAS DE ARREDONDAMENTO'}
              </h4>

              <div className="space-y-2">
                {/* Tier 1 */}
                <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">Tier 1: Economias Desenvolvidas (1.00x)</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">EUA, CA, UK, DE, FR, IT, ES, AU, JP...</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Mantido em USD/Moeda desenvolvida com números redondos (1,00 / 5,00 / 50,00). 50 créditos = USD 50,00.
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="p-3 rounded-xl border border-[#009EE3]/40 bg-[#009EE3]/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#009EE3]">Tier 2: Renda Média - Desconto 50% (0.50x)</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Brasil, México, Argentina, Colômbia...</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    <strong>Brasil (BR):</strong> Fixado em <strong>R$ 1,00 por crédito</strong> (número redondo inteiro). Ex: 50 créditos = <strong>R$ 50,00</strong>. Demais países: conversão local arredondada para número inteiro.
                  </p>
                </div>

                {/* Tier 3 */}
                <div className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">Tier 3: Acessibilidade - Desconto 70% (0.30x)</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Índia, Indonésia, Filipinas, Vietnã...</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    Preço por crédito = <strong>USD 0,30</strong> com valores redondos e inteiros. 50 créditos = <strong>USD 15,00</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* IP Detection Explanation */}
            <div className="rounded-xl border border-[var(--border)] p-3 bg-[var(--surface-2)] flex items-start gap-2.5 text-xs font-mono">
              <Info size={16} className="text-[#009EE3] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-[var(--foreground)]">
                  {isEnglish ? 'How Geolocation Detection Works' : 'Como Funciona o Rastreamento de IP'}
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {isEnglish
                    ? `Your IP is checked via Cloudflare & reverse-proxy headers (/api/geo/detect) to automatically bind the correct currency and regional parity multiplier without exposing private data.`
                    : `Seu IP é validado pelo servidor (/api/geo/detect) via cabeçalhos de borda e geolocalização para aplicar instantaneamente a moeda nativa e o desconto regional da sua localidade.`}
                </p>
              </div>
            </div>

            {/* Footer Close */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
                className="w-full py-2.5 rounded-xl bg-[#009EE3] hover:bg-[#0081b8] text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {isEnglish ? 'Got it' : 'Entendido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
