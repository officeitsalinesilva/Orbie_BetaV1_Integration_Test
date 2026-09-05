import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sliders,
  Check,
  X,
  Edit3,
  DollarSign,
  Coins,
  ArrowRight,
  ShieldCheck,
  Percent,
  Play,
  Sparkles,
} from 'lucide-react';
import { adminApi, commercialApi } from '../../../services/api';
import { CommercialRegionUI, CommercialProductUI } from './types';

interface Props {
  regions: CommercialRegionUI[];
  products: CommercialProductUI[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  isEnglish?: boolean;
}

export function AdminCommercialPricingTab({
  regions,
  products,
  loading,
  onRefresh,
  showToast,
  isEnglish = false,
}: Props) {
  const [editingRegion, setEditingRegion] = useState<CommercialRegionUI | null>(null);
  const [regionForm, setRegionForm] = useState<Partial<CommercialRegionUI>>({});

  // Simulator State
  const [simProductId, setSimProductId] = useState<string>(products[0]?.id || 'AST-001');
  const [simCountry, setSimCountry] = useState<string>('BR');
  const [simCouponCode, setSimCouponCode] = useState<string>('');
  const [simQuote, setSimQuote] = useState<any | null>(null);
  const [simLoading, setSimLoading] = useState<boolean>(false);

  useEffect(() => {
    if (products.length > 0 && !simProductId) {
      setSimProductId(products[0].id);
    }
  }, [products]);

  const handleStartEdit = (r: CommercialRegionUI) => {
    setEditingRegion(r);
    setRegionForm({ ...r });
  };

  const handleSaveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegion) return;

    try {
      await adminApi.updateCommercialRegion(editingRegion.code, {
        ...regionForm,
        multiplier: Number(regionForm.multiplier) || 1.0,
        discountPercent: Number(regionForm.discountPercent) || 0,
      });
      showToast(
        isEnglish
          ? `Region ${editingRegion.code} updated successfully!`
          : `Região ${editingRegion.code} atualizada com sucesso!`
      );
      setEditingRegion(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar política regional.', 'error');
    }
  };

  const handleRunSimulation = async () => {
    if (!simProductId) return;
    try {
      setSimLoading(true);
      const quote = await commercialApi.getQuote({
        productId: simProductId,
        detectedCountry: simCountry,
        selectedCountry: simCountry,
        couponCode: simCouponCode.trim() ? simCouponCode.trim() : undefined,
      });
      setSimQuote(quote);
    } catch (err: any) {
      showToast(err.message || 'Erro ao simular cotação.', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-bold text-[var(--foreground)] font-mono flex items-center gap-2">
          <Globe size={16} className="text-[var(--accent)]" />
          <span>{isEnglish ? 'Regional Policies & Pricing Engine' : 'Políticas Regionais & Motor de Preços'}</span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)] font-mono">
          {isEnglish
            ? 'Deterministic formula: BASE PRICE → REGIONAL POLICY → CURRENCY → REGIONAL PRICE → DISCOUNT → FINAL PRICE.'
            : 'Fórmula determinística: PREÇO BASE → POLÍTICA REGIONAL → MOEDA → PREÇO REGIONAL → DESCONTO → PREÇO FINAL.'}
        </p>
      </div>

      {/* Edit Region Form Modal / Card */}
      {editingRegion && (
        <form
          onSubmit={handleSaveRegion}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4 font-mono text-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="font-bold text-[var(--foreground)]">
              Editar Política Regional: {editingRegion.name} ({editingRegion.code})
            </span>
            <button
              type="button"
              onClick={() => setEditingRegion(null)}
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                Moeda (ISO)
              </label>
              <input
                type="text"
                value={regionForm.currency || ''}
                onChange={(e) => setRegionForm({ ...regionForm, currency: e.target.value.toUpperCase() })}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                Multiplicador Regional
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={regionForm.multiplier ?? 1.0}
                onChange={(e) =>
                  setRegionForm({ ...regionForm, multiplier: parseFloat(e.target.value) || 1.0 })
                }
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Ex: 0.20 = 20% do valor em BRL convertido para USD</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                Desconto Regional Padrão (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={regionForm.discountPercent ?? 0}
                onChange={(e) =>
                  setRegionForm({ ...regionForm, discountPercent: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingRegion(null)}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs hover:opacity-90"
            >
              Salvar Política
            </button>
          </div>
        </form>
      )}

      {/* Regional Policies Table */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
              <tr>
                <th className="px-4 py-2.5">Código / Região</th>
                <th className="px-4 py-2.5">Moeda</th>
                <th className="px-4 py-2.5">Multiplicador</th>
                <th className="px-4 py-2.5">Desconto Regional</th>
                <th className="px-4 py-2.5">Meios de Pagamento</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {regions.map((r) => (
                <tr key={r.code} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-[var(--foreground)]">{r.name}</div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{r.code}</div>
                  </td>

                  <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                    {r.currency}
                  </td>

                  <td className="px-4 py-3">
                    <span className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)] font-bold">
                      {r.multiplier.toFixed(2)}x
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {r.discountPercent > 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                        {r.discountPercent}% OFF
                      </span>
                    ) : (
                      <span className="text-[var(--text-secondary)]">0%</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {r.supportedPaymentMethods.map((m) => (
                        <span key={m} className="px-1 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.active
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${r.active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      {r.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(r)}
                      className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer border border-[var(--border)]"
                      title="Editar política regional"
                    >
                      <Edit3 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator: Server-Authoritative Quote Tester */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[var(--accent)]" />
            <span className="font-bold text-[var(--foreground)] uppercase">
              {isEnglish ? 'Authoritative Price Quote Simulator' : 'Simulador Autoritativo de Cotação de Preço'}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">Testa a API server-side /api/pricing/quote</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
              Produto Alvo
            </label>
            <select
              value={simProductId}
              onChange={(e) => setSimProductId(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} (R$ {(p.basePriceCents / 100).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
              País / Região
            </label>
            <select
              value={simCountry}
              onChange={(e) => setSimCountry(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            >
              {regions.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name} ({r.code}) — {r.currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
              Cupom (Opcional)
            </label>
            <input
              type="text"
              value={simCouponCode}
              onChange={(e) => setSimCouponCode(e.target.value.toUpperCase())}
              placeholder="EX: PROMO20"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={simLoading}
              className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Play size={14} />
              <span>{simLoading ? 'Calculando...' : 'Calcular Cotação'}</span>
            </button>
          </div>
        </div>

        {/* Simulation Output Breakdown */}
        {simQuote && (
          <div className="mt-4 p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--surface)] space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="font-bold text-[var(--foreground)]">Resultado do Motor de Cotação</span>
              <span className="text-[10px] text-[var(--accent)] font-bold">Cálculo Autoritativo Server-Side</span>
            </div>

            {/* Step-by-Step Mathematical Sequence */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">1. Preço Base</span>
                <span className="text-xs font-bold text-[var(--foreground)]">
                  R$ {(simQuote.breakdown.basePriceCents / 100).toFixed(2)}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  {simQuote.breakdown.basePriceCents} centavos
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">2. Política Regional</span>
                <span className="text-xs font-bold text-[var(--foreground)]">
                  Região {simQuote.breakdown.regionCode}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  Fator: {simQuote.breakdown.regionalMultiplier}x
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">3. Moeda</span>
                <span className="text-xs font-bold text-[var(--foreground)]">
                  {simQuote.currency}
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  Calculado s/ float
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-secondary)] block">4. Desconto</span>
                <span className="text-xs font-bold text-emerald-500">
                  {simQuote.breakdown.discountPercent}% OFF
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  -{simQuote.breakdown.discountCents} centavos
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-[var(--accent)]/15 border border-[var(--accent)]/30">
                <span className="text-[10px] text-[var(--text-secondary)] block">5. Preço Final</span>
                <span className="text-sm font-bold text-[var(--foreground)]">
                  {simQuote.formattedPrice}
                </span>
                <span className="text-[9px] text-[var(--accent)] block font-bold">
                  ◎ {simQuote.breakdown.creditPrice} créditos
                </span>
              </div>
            </div>

            {/* Methods */}
            <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] pt-1">
              <span>Meios autorizados para {simQuote.countryCode}:</span>
              <div className="flex gap-1 font-bold text-[var(--foreground)]">
                {simQuote.supportedPaymentMethods.map((m: string) => (
                  <span key={m} className="px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
