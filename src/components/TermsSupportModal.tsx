import React from 'react';
import { X, Shield, FileText, HelpCircle, Mail } from 'lucide-react';
import { SupportModal } from './SupportModal';

type Props = {
  type: 'terms' | 'privacy' | 'support';
  onClose: () => void;
  isEnglish: boolean;
};

export function TermsSupportModal({ type, onClose, isEnglish }: Props) {
  if (type === 'support') {
    return <SupportModal isOpen={true} onClose={onClose} isEnglish={isEnglish} initialTab="faq" />;
  }

  const content = {
    terms: {
      title: isEnglish ? 'Terms of Use' : 'Termos de Uso',
      icon: FileText,
      body: isEnglish
        ? 'Welcome to Orb. By accessing or using our platform, you agree to our terms of consciousness and personal self-development services. All astrological, archetypal, and temporal synthesis calculations are designed strictly for reflective, self-discovery, and developmental assistance.'
        : 'Bem-vindo ao Orb. Ao acessar ou usar nossa plataforma, você concorda com nossos termos de uso dos serviços de consciência e desenvolvimento pessoal. Todas as sínteses astrológicas, arquetípicas e temporais são projetadas com foco em reflexão, autoconhecimento e planejamento consciente.',
    },
    privacy: {
      title: isEnglish ? 'Privacy Policy' : 'Política de Privacidade',
      icon: Shield,
      body: isEnglish
        ? 'Your privacy and data sovereignty are fundamental at Orb. Your personal information, birth details, and daily journal reflections are stored securely with client-side encryption. We do not sell or monetize your personal journal entries.'
        : 'Sua privacidade e a soberania dos seus dados são fundamentais no Orb. Suas informações de nascimento, registros do diário e notas de consciência são protegidos com segurança. Seus dados nunca são comercializados ou compartilhados com terceiros.',
    },
  }[type];

  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">{content.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[var(--text-secondary)]">
          {content.body}
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-[var(--surface-2)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
          >
            {isEnglish ? 'Close' : 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
}
