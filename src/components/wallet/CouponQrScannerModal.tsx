import React, { useState, useEffect } from 'react';
import { QrCode, X, Camera, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { useOrb } from '../../context/OrbContext';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isEnglish?: boolean;
};

export function CouponQrScannerModal({ isOpen, onClose, isEnglish = false }: Props) {
  const { redeemCoupon } = useOrb();
  const [scanning, setScanning] = useState(true);
  const [resultMessage, setResultMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Compute current dynamic valid coupon for optical simulation without exposing codes
  const currentWeek = Math.min(4, Math.max(1, Math.ceil(new Date().getDate() / 7)));
  const weeklyCode = `${currentWeek}SMES.10-LINE`;
  const dailyCode = '24HR.10-LINE';

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      setResultMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    setScanning(false);
    const result = redeemCoupon(code);
    setResultMessage({
      success: result.success,
      text: result.message,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm my-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5 bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-2">
            <QrCode size={17} className="text-[var(--accent)]" />
            <h3 className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wider">
              {isEnglish ? 'Coupon QR Scanner' : 'Leitor QR Code de Cupom'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEnglish ? 'Close' : 'Fechar'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scanner Viewfinder / Camera Simulation */}
        <div className="p-5 space-y-4 font-mono">
          {scanning ? (
            <div className="space-y-3.5">
              {/* Compact Optical Viewfinder */}
              <div className="relative w-44 h-44 mx-auto rounded-xl overflow-hidden bg-black/95 border border-emerald-500/40 flex items-center justify-center shadow-inner">
                {/* Laser animation */}
                <div className="absolute inset-x-3 h-0.5 bg-emerald-400/90 shadow-[0_0_10px_#34d399] animate-pulse top-1/2 -translate-y-1/2" />

                {/* Viewfinder Corners */}
                <div className="absolute top-3 left-3 h-4 w-4 border-t-2 border-l-2 border-emerald-400" />
                <div className="absolute top-3 right-3 h-4 w-4 border-t-2 border-r-2 border-emerald-400" />
                <div className="absolute bottom-3 left-3 h-4 w-4 border-b-2 border-l-2 border-emerald-400" />
                <div className="absolute bottom-3 right-3 h-4 w-4 border-b-2 border-r-2 border-emerald-400" />

                {/* Camera simulation icon */}
                <div className="flex flex-col items-center gap-1.5 text-emerald-400/80">
                  <Camera size={24} className="animate-pulse" />
                  <span className="text-[9px] tracking-wider font-bold">
                    {isEnglish ? 'ALIGN QR CODE' : 'APONTE A CÂMERA'}
                  </span>
                </div>
              </div>

              <p className="text-center text-[11px] text-[var(--text-secondary)] leading-relaxed px-2">
                {isEnglish
                  ? 'Optical validation active. Point at a valid promotion QR code.'
                  : 'Validação óptica ativa. Posicione o QR Code promocional no enquadramento.'}
              </p>

              {/* Optical Detection Triggers (Sem expor o nome ou string secreta dos cupons) */}
              <div className="rounded-xl bg-[var(--surface-2)] p-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-secondary)] uppercase">
                  <span>{isEnglish ? 'OPTICAL SIGNAL DETECTED' : 'SINAL QR DETECTADO'}</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {isEnglish ? 'ACTIVE' : 'ATIVO'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleScanCode(dailyCode)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)]/40 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Zap size={14} className="text-amber-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-[var(--foreground)] block">
                          {isEnglish ? 'Capture Daily Promo QR' : 'Capturar QR Promocional Diário'}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {isEnglish ? 'Daily check-in promo (1x/day)' : 'Válido 1 vez a cada 24 horas'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--accent)] shrink-0 px-2 py-0.5 rounded bg-[var(--surface-2)]">
                      +10 ◎
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleScanCode(weeklyCode)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface)] hover:bg-[var(--border)]/40 transition-colors cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode size={14} className="text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-xs font-bold text-[var(--foreground)] block">
                          {isEnglish ? `Capture Weekly Promo QR` : `Capturar QR Promocional da Semana`}
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">
                          {isEnglish ? `Promo week ${currentWeek} of the month` : `Semana ${currentWeek} vigente do mês`}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--accent)] shrink-0 px-2 py-0.5 rounded bg-[var(--surface-2)]">
                      +10 ◎
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 flex flex-col items-center text-center space-y-3.5">
              {resultMessage?.success ? (
                <div className="h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-in zoom-in">
                  <CheckCircle2 size={28} />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 animate-in zoom-in">
                  <AlertCircle size={28} />
                </div>
              )}

              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
                  {resultMessage?.success
                    ? (isEnglish ? 'QR Code Successfully Processed' : 'QR Code Processado com Sucesso')
                    : (isEnglish ? 'Validation Notice' : 'Aviso de Validação')}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] max-w-xs leading-relaxed">
                  {resultMessage?.text}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setScanning(true);
                    setResultMessage(null);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--border)] text-xs font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>{isEnglish ? 'Scan Another' : 'Escanear Outro'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 px-3 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer text-center"
                >
                  {isEnglish ? 'Close' : 'Fechar'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
