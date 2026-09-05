import React, { useState } from 'react';
import {
  Plus,
  Edit3,
  Check,
  X,
  AlertCircle,
  Coins,
  DollarSign,
  Tag,
  Shield,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../../services/api';
import { CommercialProductUI } from './types';

interface Props {
  products: CommercialProductUI[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  showToast: (msg: string, type?: 'success' | 'error') => void;
  isEnglish?: boolean;
}

export function AdminCommercialProductsTab({
  products,
  loading,
  onRefresh,
  showToast,
  isEnglish = false,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingProduct, setEditingProduct] = useState<CommercialProductUI | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<CommercialProductUI>>({
    id: '',
    code: '',
    name: '',
    description: '',
    category: 'astrologia',
    type: 'artefato',
    basePriceCents: 2900,
    baseCurrency: 'BRL',
    creditPrice: 50,
    allowsCreditPurchase: true,
    allowsFiatPurchase: true,
    entitlementType: 'PERMANENT',
    policy: {
      freeAllowed: false,
      subscriptionIncluded: false,
      couponEligible: true,
      maxDiscountPercent: 50,
    },
    status: 'active',
  });

  const categories = [
    { id: 'all', label: isEnglish ? 'All Categories' : 'Todas as Categorias' },
    { id: 'astrologia', label: 'Astrologia' },
    { id: 'cabala', label: 'Cabala & Tarot' },
    { id: 'numerologia', label: 'Numerologia' },
    { id: 'chave-mestra', label: 'Chave Mestra' },
    { id: 'mensais-anuais', label: isEnglish ? 'Cycles & Months' : 'Mensais & Anuais' },
    { id: 'ferramenta', label: isEnglish ? 'Tools' : 'Ferramentas' },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStartCreate = () => {
    setFormData({
      id: '',
      code: '',
      name: '',
      description: '',
      category: 'astrologia',
      type: 'artefato',
      basePriceCents: 2900,
      baseCurrency: 'BRL',
      creditPrice: 50,
      allowsCreditPurchase: true,
      allowsFiatPurchase: true,
      entitlementType: 'PERMANENT',
      policy: {
        freeAllowed: false,
        subscriptionIncluded: false,
        couponEligible: true,
        maxDiscountPercent: 50,
      },
      status: 'active',
      validFrom: '',
      validUntil: '',
    });
    setIsCreating(true);
    setEditingProduct(null);
  };

  const handleStartEdit = (prod: CommercialProductUI) => {
    setFormData({ ...prod });
    setEditingProduct(prod);
    setIsCreating(false);
  };

  const handleSetStatus = async (prod: CommercialProductUI, nextStatus: 'draft' | 'active' | 'inactive' | 'archived') => {
    try {
      await adminApi.updateCommercialProductStatus(prod.id, nextStatus);
      showToast(
        isEnglish
          ? `Status of ${prod.code} changed to ${nextStatus}`
          : `Status de ${prod.code} alterado para ${nextStatus}`
      );
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao alterar status.', 'error');
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      showToast('Código e Nome são obrigatórios.', 'error');
      return;
    }

    try {
      if (isCreating) {
        const payload = {
          ...formData,
          id: formData.id || formData.code?.toUpperCase(),
          code: formData.code?.toUpperCase(),
          basePriceCents: Number(formData.basePriceCents) || 0,
          creditPrice: Number(formData.creditPrice) || 0,
        };
        await adminApi.createCommercialProduct(payload);
        showToast(isEnglish ? 'Product created successfully!' : 'Produto criado com sucesso!');
      } else if (editingProduct) {
        const payload = {
          ...formData,
          basePriceCents: Number(formData.basePriceCents) || 0,
          creditPrice: Number(formData.creditPrice) || 0,
        };
        await adminApi.updateCommercialProduct(editingProduct.id, payload);
        showToast(isEnglish ? 'Product updated successfully!' : 'Produto atualizado com sucesso!');
      }
      setIsCreating(false);
      setEditingProduct(null);
      await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao salvar produto.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] font-mono flex items-center gap-2">
            <Tag size={16} className="text-[var(--accent)]" />
            <span>{isEnglish ? 'Commercial Catalog & Products' : 'Catálogo Comercial & Produtos'}</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            {isEnglish
              ? 'Configure items, authoritative prices in BRL cents and credit values, eligibility and entitlements.'
              : 'Configure itens, preços autoritativos em centavos e créditos, elegibilidade e entitlements.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-mono font-bold hover:opacity-90 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>{isEnglish ? 'New Product' : 'Novo Produto'}</span>
        </button>
      </div>

      {/* Create / Edit Form Drawer/Card */}
      {(isCreating || editingProduct) && (
        <form
          onSubmit={handleSaveForm}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5 space-y-4 font-mono text-xs animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="font-bold text-[var(--foreground)] uppercase">
              {isCreating
                ? isEnglish
                  ? 'Create Commercial Product'
                  : 'Criar Produto Comercial'
                : isEnglish
                ? `Edit Product: ${editingProduct?.code}`
                : `Editar Produto: ${editingProduct?.code}`}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingProduct(null);
              }}
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Code (SKU) *' : 'Código (SKU) *'}
              </label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Ex: AST-001"
                disabled={!isCreating}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)] uppercase font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Product Name *' : 'Nome do Produto *'}
              </label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Mapa Natal & Revolução Solar"
                required
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
              {isEnglish ? 'Description' : 'Descrição Comercial'}
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              placeholder="Descrição completa exibida na loja e fatura..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Category' : 'Categoria'}
              </label>
              <select
                value={formData.category || 'astrologia'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              >
                <option value="astrologia">Astrologia</option>
                <option value="cabala">Cabala & Tarot</option>
                <option value="numerologia">Numerologia</option>
                <option value="chave-mestra">Chave Mestra</option>
                <option value="mensais-anuais">Mensais & Anuais</option>
                <option value="ferramenta">Ferramentas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Base Price (Cents R$)' : 'Preço Base (Centavos R$)'}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.basePriceCents || 0}
                onChange={(e) =>
                  setFormData({ ...formData, basePriceCents: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
              <span className="text-[10px] text-[var(--text-secondary)]">
                Ex: 2900 = R$ {(Number(formData.basePriceCents || 0) / 100).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Credit Price (◎)' : 'Preço em Créditos (◎)'}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.creditPrice || 0}
                onChange={(e) =>
                  setFormData({ ...formData, creditPrice: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Entitlement' : 'Tipo de Acesso'}
              </label>
              <select
                value={formData.entitlementType || 'PERMANENT'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    entitlementType: e.target.value as any,
                  })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              >
                <option value="PERMANENT">PERMANENT (Vitalício)</option>
                <option value="TEMPORARY">TEMPORARY (Por Período)</option>
                <option value="USAGE_LIMITED">USAGE_LIMITED (Por Uso)</option>
              </select>
            </div>
          </div>

          {/* Status and Validity Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--surface-2)]/50 p-3 rounded-lg border border-[var(--border)]">
            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Publication Status' : 'Status de Publicação'}
              </label>
              <select
                value={formData.status || 'active'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
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
                {isEnglish ? 'Valid From (Optional)' : 'Válido De (Opcional)'}
              </label>
              <input
                type="datetime-local"
                value={formData.validFrom ? formData.validFrom.slice(0, 16) : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validFrom: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--foreground)] mb-1">
                {isEnglish ? 'Valid Until (Optional)' : 'Válido Até (Opcional)'}
              </label>
              <input
                type="datetime-local"
                value={formData.validUntil ? formData.validUntil.slice(0, 16) : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    validUntil: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                  })
                }
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* Eligibility Toggles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--surface)] p-3 rounded-lg border border-[var(--border)]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowsCreditPurchase ?? true}
                onChange={(e) =>
                  setFormData({ ...formData, allowsCreditPurchase: e.target.checked })
                }
                className="rounded border-[var(--border)]"
              />
              <span className="text-[11px] text-[var(--foreground)]">Compra c/ Créditos</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allowsFiatPurchase ?? true}
                onChange={(e) =>
                  setFormData({ ...formData, allowsFiatPurchase: e.target.checked })
                }
                className="rounded border-[var(--border)]"
              />
              <span className="text-[11px] text-[var(--foreground)]">Compra c/ Dinheiro</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.policy?.couponEligible ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policy: { ...formData.policy!, couponEligible: e.target.checked },
                  })
                }
                className="rounded border-[var(--border)]"
              />
              <span className="text-[11px] text-[var(--foreground)]">Aceita Cupom</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.policy?.subscriptionIncluded ?? false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    policy: { ...formData.policy!, subscriptionIncluded: e.target.checked },
                  })
                }
                className="rounded border-[var(--border)]"
              />
              <span className="text-[11px] text-[var(--foreground)]">Incluso no Pro</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setEditingProduct(null);
              }}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)]"
            >
              {isEnglish ? 'Cancel' : 'Cancelar'}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold shadow-2xs hover:opacity-90"
            >
              {isEnglish ? 'Save Product' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isEnglish ? 'Search products by name or code...' : 'Buscar produtos por nome ou código...'}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] pl-9 pr-3 py-1.5 text-xs text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 font-mono text-[11px]">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold'
                  : 'bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--foreground)] border border-[var(--border)]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table/Grid */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
              <tr>
                <th className="px-4 py-2.5">Código / SKU</th>
                <th className="px-4 py-2.5">Nome & Categoria</th>
                <th className="px-4 py-2.5">Preço Base</th>
                <th className="px-4 py-2.5">Créditos</th>
                <th className="px-4 py-2.5">Entitlement</th>
                <th className="px-4 py-2.5">Políticas</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                    {isEnglish ? 'No commercial products found.' : 'Nenhum produto comercial encontrado.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const fiatDisplay = `R$ ${(p.basePriceCents / 100).toFixed(2)}`;
                  const isActive = p.status === 'active';

                  return (
                    <tr key={p.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                        <span className="px-1.5 py-0.5 rounded-sm bg-[var(--surface-2)] border border-[var(--border)] text-[11px]">
                          {p.code}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-bold text-[var(--foreground)]">{p.name}</div>
                        <div className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                          <span className="capitalize">{p.category}</span>
                          <span>•</span>
                          <span>{p.type}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} className="text-emerald-500" />
                          <span>{fiatDisplay}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 font-bold text-[var(--accent)]">
                          <Coins size={12} />
                          <span>◎ {p.creditPrice}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] border border-[var(--border)]">
                          {p.entitlementType}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-[10px]">
                          {p.policy.couponEligible && (
                            <span className="px-1 py-0.2 bg-emerald-500/10 text-emerald-600 rounded border border-emerald-500/20" title="Aceita cupom">
                              Cupom
                            </span>
                          )}
                          {p.policy.subscriptionIncluded && (
                            <span className="px-1 py-0.2 bg-purple-500/10 text-purple-600 rounded border border-purple-500/20" title="Incluso no Pro">
                              Pro
                            </span>
                          )}
                          {p.policy.freeAllowed && (
                            <span className="px-1 py-0.2 bg-blue-500/10 text-blue-600 rounded border border-blue-500/20" title="Grátis">
                              Free
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit ${
                              p.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : p.status === 'draft'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : p.status === 'archived'
                                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                p.status === 'active'
                                  ? 'bg-emerald-500'
                                  : p.status === 'draft'
                                  ? 'bg-amber-500'
                                  : p.status === 'archived'
                                  ? 'bg-rose-500'
                                  : 'bg-zinc-400'
                              }`}
                            />
                            {p.status.toUpperCase()}
                          </span>

                          {(p.validFrom || p.validUntil) && (
                            <div className="text-[9px] text-[var(--text-secondary)]">
                              {(() => {
                                const now = new Date();
                                const from = p.validFrom ? new Date(p.validFrom) : null;
                                const until = p.validUntil ? new Date(p.validUntil) : null;
                                if (from && now < from) return <span className="text-blue-400">Agendado</span>;
                                if (until && now > until) return <span className="text-rose-400">Expirado</span>;
                                return <span className="text-emerald-400">Vigente</span>;
                              })()}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <select
                            value={p.status}
                            onChange={(e) => handleSetStatus(p, e.target.value as any)}
                            className="text-[10px] font-bold py-1 px-1.5 rounded border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] outline-none cursor-pointer"
                          >
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="archived">Archived</option>
                          </select>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer border border-[var(--border)]"
                            title="Editar produto"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
