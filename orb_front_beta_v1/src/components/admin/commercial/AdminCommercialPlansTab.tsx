import React, { useState, useEffect } from 'react';
import {
  Crown,
  Flame,
  Coins,
  Check,
  Edit3,
  X,
  Layers,
  Sparkles,
  Shield,
  Save,
} from 'lucide-react';
import { adminApi } from '../../../services/api';
import { CommercialPlanUI, CommercialDailyCreditRuleUI } from './types';

interface Props {
  plans: CommercialPlanUI[];
  dailyRule: CommercialDailyCreditRuleUI | null;
  loading: boolean;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  isEnglish?: boolean;
}

export function AdminCommercialPlansTab({
  plans,
  dailyRule,
  loading,
  onRefresh,
  showToast,
  isEnglish = false,
}: Props) {
  // Daily Credit Rule State
  const [dailyForm, setDailyForm] = useState<Partial<CommercialDailyCreditRuleUI>>({
    baseCredits: 5,
    streakBonusCredits: 5,
    streakRequiredDays: 3,
    maxDailyBenefitCredits: 10,
    allowProDoubling: true,
  });

  // Plan Edit State
  const [editingPlan, setEditingPlan] = useState<CommercialPlanUI | null>(null);
  const [planForm, setPlanForm] = useState<Partial<CommercialPlanUI>>({});

  useEffect(() => {
    if (dailyRule) {
      setDailyForm({ ...dailyRule });
    }
  }, [dailyRule]);

  const handleSaveDailyCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.updateCommercialDailyCredits({
        baseCredits: Number(dailyForm.baseCredits) || 5,
        streakBonusCredits: Number(dailyForm.streakBonusCredits) || 5,
        streakRequiredDays: Number(dailyForm.streakRequiredDays) || 3,
        maxDailyBenefitCredits: Number(dailyForm.maxDailyBenefitCredits) || 10,
        allowProDoubling: dailyForm.allowProDoubling ?? true,
      });
      showToast(
        isEnglish
          ? 'Daily credit rules updated and versioned!'
          : 'Regras de créditos diários atualizadas e versionadas com sucesso!'
      );
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar regras de créditos diários.', 'error');
    }
  };

  const handleStartEditPlan = (plan: CommercialPlanUI) => {
    setEditingPlan(plan);
    setPlanForm({ ...plan });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      await adminApi.updateCommercialPlan(editingPlan.id, {
        ...planForm,
        priceMonthlyCents: Number(planForm.priceMonthlyCents) || 0,
        dailyCreditsGranted: Number(planForm.dailyCreditsGranted) || 0,
        streakBonusCreditsGranted: Number(planForm.streakBonusCreditsGranted) || 0,
        catalogDiscountPercent: Number(planForm.catalogDiscountPercent) || 0,
      });
      showToast(
        isEnglish ? `Plan ${editingPlan.name} updated successfully!` : `Plano ${editingPlan.name} atualizado com sucesso!`
      );
      setEditingPlan(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar plano.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: Daily Credit Commercial Rules */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-[var(--accent)]" />
            <span className="font-bold text-[var(--foreground)] uppercase">
              {isEnglish ? 'Daily Credits Engine Rules' : 'Regras Comerciais de Créditos Diários'}
            </span>
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">
            Versão Atual: v{dailyRule?.version || 1}
          </span>
        </div>

        <form onSubmit={handleSaveDailyCredits} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                Crédito Base por Resgate
              </label>
              <input
                type="number"
                min="1"
                value={dailyForm.baseCredits ?? 5}
                onChange={(e) =>
                  setDailyForm({ ...dailyForm, baseCredits: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Padrão canônico: 5 créditos</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                Bônus de Streak Ativo
              </label>
              <input
                type="number"
                min="0"
                value={dailyForm.streakBonusCredits ?? 5}
                onChange={(e) =>
                  setDailyForm({ ...dailyForm, streakBonusCredits: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Padrão canônico: 5 créditos</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                Dias P/ Ativar Streak
              </label>
              <input
                type="number"
                min="1"
                value={dailyForm.streakRequiredDays ?? 3}
                onChange={(e) =>
                  setDailyForm({ ...dailyForm, streakRequiredDays: parseInt(e.target.value, 10) || 1 })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Padrão canônico: 3 dias</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                Teto Máximo Diário
              </label>
              <input
                type="number"
                min="1"
                value={dailyForm.maxDailyBenefitCredits ?? 10}
                onChange={(e) =>
                  setDailyForm({
                    ...dailyForm,
                    maxDailyBenefitCredits: parseInt(e.target.value, 10) || 10,
                  })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">Limite de segurança por dia</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyForm.allowProDoubling ?? true}
                onChange={(e) =>
                  setDailyForm({ ...dailyForm, allowProDoubling: e.target.checked })
                }
                className="rounded border-[var(--border)]"
              />
              <span className="text-[11px] text-[var(--foreground)]">
                Dobrar créditos diários para assinantes do Plano Pro
              </span>
            </label>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs hover:opacity-90 transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>Salvar Regras de Créditos</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: Plans Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[var(--foreground)] font-mono flex items-center gap-2">
              <Crown size={16} className="text-amber-500" />
              <span>{isEnglish ? 'Subscription Tiers & Plans' : 'Planos & Assinaturas'}</span>
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-mono">
              {isEnglish
                ? 'Configure monthly fees, bundled daily benefits and catalog discounts.'
                : 'Configure mensalidades, benefícios embutidos de créditos diários e descontos em catálogo.'}
            </p>
          </div>
        </div>

        {/* Edit Plan Modal/Card */}
        {editingPlan && (
          <form
            onSubmit={handleSavePlan}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-4 font-mono text-xs animate-in fade-in duration-150"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="font-bold text-[var(--foreground)]">
                Editar Plano: {editingPlan.name}
              </span>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  value={planForm.name || ''}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                  Mensalidade (Centavos R$)
                </label>
                <input
                  type="number"
                  min="0"
                  value={planForm.priceMonthlyCents || 0}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, priceMonthlyCents: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Ex: 3900 = R$ {(Number(planForm.priceMonthlyCents || 0) / 100).toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                  Desconto no Catálogo (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={planForm.catalogDiscountPercent || 0}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, catalogDiscountPercent: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                  Status de Publicação
                </label>
                <select
                  value={planForm.status || 'active'}
                  onChange={(e) => setPlanForm({ ...planForm, status: e.target.value as any })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                >
                  <option value="draft">DRAFT (Rascunho)</option>
                  <option value="active">ACTIVE (Ativo em Produção)</option>
                  <option value="inactive">INACTIVE (Inativo)</option>
                  <option value="archived">ARCHIVED (Arquivado)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                  Válido De (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={planForm.validFrom ? planForm.validFrom.slice(0, 16) : ''}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      validFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                  Válido Até (Opcional)
                </label>
                <input
                  type="datetime-local"
                  value={planForm.validUntil ? planForm.validUntil.slice(0, 16) : ''}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      validUntil: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs hover:opacity-90"
              >
                Salvar Plano
              </button>
            </div>
          </form>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((p) => {
            const isPro = p.tier === 'PRO';
            const priceDisplay =
              p.priceMonthlyCents === 0
                ? 'Grátis'
                : `R$ ${(p.priceMonthlyCents / 100).toFixed(2)} / mês`;

            return (
              <div
                key={p.id}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-4 font-mono text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[var(--foreground)] flex items-center gap-1.5">
                      {isPro ? <Crown size={16} className="text-amber-500" /> : <Layers size={16} />}
                      {p.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : p.status === 'draft'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : p.status === 'archived'
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}
                      >
                        {p.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-2)] border border-[var(--border)]">
                        Tier {p.tier}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] mb-4">{p.description}</p>

                  <div className="text-base font-bold text-[var(--foreground)] mb-3">{priceDisplay}</div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                      <Coins size={12} className="text-[var(--accent)]" />
                      <span>Créditos diários base: ◎ {p.dailyCreditsGranted}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[var(--foreground)]">
                      <Flame size={12} className="text-amber-500" />
                      <span>Bônus de streak: ◎ {p.streakBonusCreditsGranted}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-600">
                      <Check size={12} />
                      <span>Desconto no catálogo: {p.catalogDiscountPercent}% OFF</span>
                    </div>

                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Check size={12} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleStartEditPlan(p)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] font-bold hover:bg-[var(--surface)] transition-colors cursor-pointer"
                  >
                    <Edit3 size={13} />
                    <span>Editar Regras do Plano</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
