import React, { useState, useEffect } from 'react';
import {
  FileText,
  History,
  Eye,
  Check,
  Copy,
  Clock,
  Shield,
  Layers,
  Sparkles,
  Tag,
  Coins,
  Globe,
  Crown,
  Download,
  Upload,
  RotateCcw,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import { adminApi } from '../../../services/api';
import { CommercialConfigVersionUI } from './types';

interface Props {
  commercialVersions: CommercialConfigVersionUI[];
  redemptions: any[];
  auditLogs: any[];
  showToast: (msg: string, type?: 'success' | 'error') => void;
  isEnglish?: boolean;
  onRefresh?: () => Promise<void>;
}

export function AdminCommercialAuditTab({
  commercialVersions,
  redemptions,
  auditLogs,
  showToast,
  isEnglish = false,
  onRefresh,
}: Props) {
  const [selectedSnapshot, setSelectedSnapshot] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [subTab, setSubTab] = useState<'commercial_versions' | 'orders' | 'redemptions' | 'logs'>('commercial_versions');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await adminApi.getPaymentOrders();
      setOrders(res.orders || []);
    } catch (err: any) {
      console.warn('Could not fetch payment orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (subTab === 'orders') {
      fetchOrders();
    }
  }, [subTab]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado!`);
  };

  const handleExportConfig = async () => {
    try {
      setActionLoading(true);
      const config = await adminApi.exportCommercialConfig();
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orbie_commercial_config_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(isEnglish ? 'Commercial configuration exported!' : 'Configuração comercial exportada!');
    } catch (err: any) {
      showToast(err.message || 'Erro ao exportar configuração.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleImportConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importJsonText.trim()) {
      showToast('Insira o JSON da configuração comercial.', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const parsed = JSON.parse(importJsonText);
      await adminApi.importCommercialConfig(parsed);
      showToast(isEnglish ? 'Configuration imported successfully!' : 'Configuração comercial importada com sucesso!');
      setIsImportOpen(false);
      setImportJsonText('');
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'JSON inválido ou erro ao importar configuração.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async (v: CommercialConfigVersionUI) => {
    const confirmMsg = isEnglish
      ? `Confirm rollback of ${v.entityType} (${v.entityId}) to version ${v.version}?`
      : `Deseja realmente reverter ${v.entityType} (${v.entityId}) para o snapshot da versão ${v.version}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await adminApi.rollbackCommercialVersion(v.id);
      showToast(
        isEnglish
          ? `Rollback to version ${v.version} succeeded!`
          : `Reversão para a versão ${v.version} realizada com sucesso!`
      );
      if (onRefresh) await onRefresh();
    } catch (err: any) {
      showToast(err.message || 'Erro ao reverter versão.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Tag size={12} className="text-[var(--accent)]" />;
      case 'daily_credits':
        return <Coins size={12} className="text-amber-500" />;
      case 'regional_policy':
        return <Globe size={12} className="text-blue-500" />;
      case 'plan':
        return <Crown size={12} className="text-purple-500" />;
      default:
        return <Layers size={12} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)] font-mono flex items-center gap-2">
            <History size={16} className="text-[var(--accent)]" />
            <span>{isEnglish ? 'Commercial Versions & Audit Trail' : 'Versionamento Comercial & Auditoria'}</span>
          </h3>
          <p className="text-xs text-[var(--text-secondary)] font-mono">
            {isEnglish
              ? 'Immutable snapshot log of every commercial product, plan, pricing rule and daily credit mutation.'
              : 'Histórico de versões e snapshots imutáveis de cada alteração em produtos, planos, regras e créditos.'}
          </p>
        </div>

        {/* Sub-tab navigation & Export/Import */}
        <div className="flex flex-wrap items-center gap-2">
          {subTab === 'commercial_versions' && (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={handleExportConfig}
                disabled={actionLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                title="Exportar configuração comercial completa"
              >
                <Download size={13} />
                <span>Exportar</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImportOpen(true)}
                disabled={actionLoading}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                title="Importar configuração comercial completa"
              >
                <Upload size={13} />
                <span>Importar</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 bg-[var(--surface-2)] p-1 rounded-lg border border-[var(--border)] font-mono text-xs">
            <button
              type="button"
              onClick={() => setSubTab('commercial_versions')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                subTab === 'commercial_versions'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Versões ({commercialVersions.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('orders')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                subTab === 'orders'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Pedidos ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('redemptions')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                subTab === 'redemptions'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Resgates ({redemptions.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('logs')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                subTab === 'logs'
                  ? 'bg-[var(--accent)] text-[var(--accent-foreground)] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              Logs ({auditLogs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {isImportOpen && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <Upload size={14} className="text-[var(--accent)]" />
              <span>{isEnglish ? 'Import Commercial Configuration (JSON)' : 'Importar Configuração Comercial (JSON)'}</span>
            </span>
            <button
              type="button"
              onClick={() => setIsImportOpen(false)}
              className="text-[var(--text-secondary)] hover:text-[var(--foreground)] cursor-pointer"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleImportConfig} className="space-y-3">
            <p className="text-[11px] text-[var(--text-secondary)]">
              Cole o JSON exportado anteriormente contendo products, regions, plans e dailyCreditRule.
            </p>
            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              rows={6}
              placeholder='{ "products": [...], "regions": [...], "plans": [...] }'
              required
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-[11px] text-[var(--foreground)] font-mono outline-none focus:border-[var(--accent)]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsImportOpen(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--foreground)] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold hover:opacity-90 cursor-pointer"
              >
                Aplicar Configuração
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Snapshot View Modal */}
      {selectedSnapshot && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 space-y-3 font-mono text-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
            <span className="font-bold text-[var(--foreground)]">
              Snapshot de Configuração: {selectedSnapshot.entityType} ({selectedSnapshot.entityId}) v{selectedSnapshot.version}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(selectedSnapshot.snapshot, null, 2), 'Snapshot')}
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] cursor-pointer"
                title="Copiar JSON"
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                onClick={() => setSelectedSnapshot(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
          <pre className="max-h-60 overflow-y-auto p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[11px] text-[var(--foreground)]">
            {JSON.stringify(selectedSnapshot.snapshot, null, 2)}
          </pre>
        </div>
      )}

      {/* SUBTAB 1: COMMERCIAL VERSIONS */}
      {subTab === 'commercial_versions' && (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Tipo & Entidade</th>
                  <th className="px-4 py-2.5">Versão</th>
                  <th className="px-4 py-2.5">Resumo da Alteração</th>
                  <th className="px-4 py-2.5">Autor</th>
                  <th className="px-4 py-2.5">Data & Hora</th>
                  <th className="px-4 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {commercialVersions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                      Nenhuma versão comercial registrada ainda.
                    </td>
                  </tr>
                ) : (
                  commercialVersions.map((v) => (
                    <tr key={v.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                        <div className="flex items-center gap-1.5">
                          {getEntityIcon(v.entityType)}
                          <span className="capitalize">{v.entityType}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[var(--surface-2)] text-[10px] text-[var(--text-secondary)] border border-[var(--border)]">
                            {v.entityId}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-[var(--accent)]">
                        v{v.version}
                      </td>

                      <td className="px-4 py-3 text-[var(--foreground)] max-w-xs truncate">
                        {v.changeSummary}
                      </td>

                      <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px] truncate max-w-[120px]">
                        {v.modifiedBy}
                      </td>

                      <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">
                        {new Date(v.timestamp).toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedSnapshot(v)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                            title="Ver snapshot completo"
                          >
                            <Eye size={12} />
                            <span>Dados</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRollback(v)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border border-amber-500/30 text-amber-500 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Reverter para esta versão"
                          >
                            <RotateCcw size={12} />
                            <span>Reverter</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ORDERS & PAYMENTS (FASE 4G) */}
      {subTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[var(--text-secondary)]">
              Auditoria de Pedidos Comerciais e Transações Gateway ({orders.length})
            </span>
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loadingOrders}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[var(--foreground)] hover:border-[var(--accent)] transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className={loadingOrders ? 'animate-spin' : ''} />
              <span>{loadingOrders ? 'Carregando...' : 'Atualizar'}</span>
            </button>
          </div>

          <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">ID do Pedido</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Usuário (UID)</th>
                    <th className="px-4 py-2.5">Produto</th>
                    <th className="px-4 py-2.5">Valor & Moeda</th>
                    <th className="px-4 py-2.5">Provedor</th>
                    <th className="px-4 py-2.5">Data Criação</th>
                    <th className="px-4 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                        {loadingOrders ? 'Carregando pedidos...' : 'Nenhum pedido registrado no sistema.'}
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => {
                      const isPaid = o.status === 'PAID';
                      const isCreated = o.status === 'CHECKOUT_CREATED';
                      const isFailed = o.status === 'FAILED' || o.status === 'CANCELLED';
                      const isRefunded = o.status === 'REFUNDED';

                      const statusBadgeClass = isPaid
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : isCreated
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : isRefunded
                        ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                        : 'bg-rose-500/10 text-rose-500 border-rose-500/20';

                      const formattedAmount = o.metadata?.formattedAmount || `${o.currency || 'BRL'} ${((o.amountInCents || 0) / 100).toFixed(2)}`;

                      return (
                        <tr key={o.orderId} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-[var(--foreground)]">
                            <div className="flex items-center gap-1.5">
                              <span className="truncate max-w-[130px]">{o.orderId}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(o.orderId, 'ID do Pedido')}
                                className="text-[var(--text-secondary)] hover:text-[var(--foreground)] cursor-pointer"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass}`}>
                              {o.status}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px] truncate max-w-[110px]">
                            {o.userId}
                          </td>

                          <td className="px-4 py-3 text-[var(--foreground)] font-semibold truncate max-w-[130px]">
                            {o.productCode || o.productId}
                          </td>

                          <td className="px-4 py-3 font-bold text-[var(--accent)]">
                            {formattedAmount}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">
                            {o.provider || 'Mercado Pago'}
                          </td>

                          <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">
                            {new Date(o.createdAt).toLocaleString()}
                          </td>

                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="flex items-center gap-1 ml-auto px-2 py-1 rounded text-[10px] font-bold border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                              title="Ver detalhes técnicos do pedido"
                            >
                              <Eye size={12} />
                              <span>Detalhes</span>
                            </button>
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
      )}

      {/* MODAL: ORDER DETAILS */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-[var(--accent)]" />
                <span className="font-bold text-[var(--foreground)]">
                  Auditoria de Pedido: {selectedOrder.orderId}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                <div className="text-[var(--text-secondary)] text-[10px]">Status</div>
                <div className="font-bold text-[var(--foreground)] text-xs mt-0.5">{selectedOrder.status}</div>
              </div>
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                <div className="text-[var(--text-secondary)] text-[10px]">Valor / Moeda</div>
                <div className="font-bold text-[var(--accent)] text-xs mt-0.5">
                  {selectedOrder.currency} {((selectedOrder.amountInCents || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                <div className="text-[var(--text-secondary)] text-[10px]">Produto</div>
                <div className="font-bold text-[var(--foreground)] mt-0.5 truncate">
                  {selectedOrder.productCode || selectedOrder.productId}
                </div>
              </div>
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)]">
                <div className="text-[var(--text-secondary)] text-[10px]">Usuário (UID)</div>
                <div className="font-bold text-[var(--foreground)] mt-0.5 truncate">
                  {selectedOrder.userId}
                </div>
              </div>
            </div>

            {selectedOrder.providerReference && (
              <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] text-[11px]">
                <div className="text-[var(--text-secondary)] text-[10px]">Referência Externa Gateway (Mercado Pago)</div>
                <div className="font-bold text-[var(--foreground)] mt-0.5 break-all">
                  {selectedOrder.providerReference}
                </div>
              </div>
            )}

            <div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase mb-1">Snapshot & Metadados Técnicos</div>
              <pre className="p-3 rounded-lg border border-[var(--border)] bg-black/40 text-[11px] text-[var(--foreground)] overflow-x-auto max-h-52 font-mono">
                {JSON.stringify(selectedOrder, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => copyToClipboard(JSON.stringify(selectedOrder, null, 2), 'JSON do Pedido')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] cursor-pointer"
              >
                <Copy size={13} />
                <span>Copiar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)] font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: REDEMPTIONS */}
      {subTab === 'redemptions' && (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Código Cupom</th>
                  <th className="px-4 py-2.5">Usuário (UID)</th>
                  <th className="px-4 py-2.5">Créditos</th>
                  <th className="px-4 py-2.5">Origem</th>
                  <th className="px-4 py-2.5">Data Resgate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                      Nenhum resgate registrado.
                    </td>
                  </tr>
                ) : (
                  redemptions.map((r) => (
                    <tr key={r.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[var(--foreground)]">{r.couponCode}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">{r.userUid}</td>
                      <td className="px-4 py-3 font-bold text-[var(--accent)]">+{r.creditsGranted} ◎</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">{r.source || 'web'}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">
                        {new Date(r.redeemedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: LOGS */}
      {subTab === 'logs' && (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--surface-2)] border-b border-[var(--border)] text-[10px] text-[var(--text-secondary)] uppercase">
                <tr>
                  <th className="px-4 py-2.5">Ação</th>
                  <th className="px-4 py-2.5">Entidade</th>
                  <th className="px-4 py-2.5">Ator</th>
                  <th className="px-4 py-2.5">Data & Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-xs text-[var(--text-secondary)]">
                      Nenhum log de auditoria registrado.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((l) => (
                    <tr key={l.id} className="hover:bg-[var(--surface-2)]/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-[var(--foreground)]">{l.action}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">{l.entityType} ({l.entityId})</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">{l.performedBy}</td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] text-[11px]">
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
