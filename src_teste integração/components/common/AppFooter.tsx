import React from 'react';
import { HelpCircle, LifeBuoy } from 'lucide-react';
import { OrbBrand } from '../OrbBrand';

type Props = {
  isEnglish?: boolean;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
  onOpenSupport?: () => void;
  className?: string;
};

export function AppFooter({
  isEnglish = false,
  onOpenTerms,
  onOpenPrivacy,
  onOpenSupport,
  className = '',
}: Props) {
  return (
    <footer
      className={`border-t border-[var(--border)] pt-8 pb-6 text-xs text-[var(--text-secondary)] space-y-4 ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand, Year 2026 & Support Icon */}
        <div className="flex items-center gap-2">
          <OrbBrand compact className="scale-75" />
          <span className="font-semibold text-[var(--foreground)]">Orb</span>
          <span className="font-mono text-[11px] text-[var(--text-tertiary)]">© 2026</span>
          {onOpenSupport && (
            <button
              type="button"
              onClick={onOpenSupport}
              aria-label={isEnglish ? 'Support & Help Desk' : 'Central de Suporte e Ajuda'}
              title={isEnglish ? 'Support, FAQs & Tutorials' : 'Suporte, FAQs e Tutoriais'}
              className="p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--accent)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer active:scale-95"
            >
              <HelpCircle size={14} />
            </button>
          )}
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
          {onOpenTerms && (
            <button
              type="button"
              onClick={onOpenTerms}
              className="hover:text-[var(--foreground)] transition-colors hover:underline cursor-pointer"
            >
              {isEnglish ? 'Terms of Use' : 'Termos de Uso'}
            </button>
          )}

          <span>·</span>

          {onOpenPrivacy && (
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="hover:text-[var(--foreground)] transition-colors hover:underline cursor-pointer"
            >
              {isEnglish ? 'Privacy Policy' : 'Política de Privacidade'}
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
