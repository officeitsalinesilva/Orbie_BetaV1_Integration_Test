import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useOrb } from '../context/OrbContext';
import { OrbTheme } from '../types';

export function OrbPreferenceControls({ compact = false }: { compact?: boolean }) {
  const { preferences, savePreferences } = useOrb();
  const isDark = preferences.theme === 'dark';

  const chooseTheme = (theme: OrbTheme) => {
    void savePreferences({ theme });
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)] ${
        compact ? 'h-8 px-1.5' : 'h-10 px-2'
      }`}
    >
      <button
        type="button"
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
        onClick={() => chooseTheme(isDark ? 'light' : 'dark')}
        className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
      >
        {isDark ? <Moon size={compact ? 14 : 16} /> : <Sun size={compact ? 14 : 16} />}
      </button>
      <div className="mx-1 h-3.5 w-px bg-[var(--border)]" />
      <button
        type="button"
        aria-label={preferences.language === 'pt-BR' ? 'Mudar para inglês' : 'Mudar para português'}
        onClick={() =>
          void savePreferences({ language: preferences.language === 'pt-BR' ? 'en' : 'pt-BR' })
        }
        className="flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-[11px] font-semibold tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
      >
        {preferences.language === 'pt-BR' ? 'PT' : 'EN'}
      </button>
    </div>
  );
}
