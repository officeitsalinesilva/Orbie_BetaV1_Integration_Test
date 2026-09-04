import React from 'react';
import {
  PanelRightClose,
  User,
  CreditCard,
  Bell,
  Sun,
  Moon,
  LogOut,
  AudioLines,
  Newspaper,
  ShoppingBag,
  Bot,
  Shield,
} from 'lucide-react';
import { useOrb } from '../../context/OrbContext';
import { GoogleProfileAvatar } from './GoogleProfileAvatar';
import { OrbTheme } from '../../types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onOpenDailyJournal?: () => void;
  onOpenNeuroacustica?: () => void;
  onOpenCatalog?: () => void;
  onOpenChat?: () => void;
  onOpenAdminCouponCenter?: () => void;
  onSignOut?: () => void;
  activeScreen?: 'daily-journal' | 'neuroacustica' | 'catalog' | 'chat' | 'profile' | 'wallet' | 'notifications';
  isEnglish?: boolean;
};

export function SystemSlideDrawer({
  isOpen,
  onClose,
  onOpenProfile,
  onOpenWallet,
  onOpenNotifications,
  onOpenDailyJournal,
  onOpenNeuroacustica,
  onOpenCatalog,
  onOpenChat,
  onOpenAdminCouponCenter,
  onSignOut,
  activeScreen,
  isEnglish = false,
}: Props) {
  const { profile, userIdentity, preferences, savePreferences, credits, isAdmin } = useOrb();

  if (!isOpen) return null;

  const name = profile?.preferredName || profile?.fullName?.split(' ')[0] || userIdentity?.name?.split(' ')[0] || (isEnglish ? 'User' : 'Usuário');

  const chooseTheme = (theme: OrbTheme) => {
    void savePreferences({ theme });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-80 max-w-[85vw] flex-col justify-between border-l border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl animate-in slide-in-from-right duration-250 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar: Left has Theme/Language Toggle, Far Right has standard Slide Close Icon */}
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]/50">
          {/* Theme & Language Compact Toggle (Positioned on the Left where X used to be) */}
          <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface-2)] h-7 px-1.5 shadow-2xs">
            <button
              type="button"
              aria-label={preferences.theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              title={preferences.theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
              onClick={() => chooseTheme(preferences.theme === 'dark' ? 'light' : 'dark')}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] cursor-pointer"
            >
              {preferences.theme === 'dark' ? <Moon size={12} /> : <Sun size={12} />}
            </button>
            <div className="mx-1 h-3 w-px bg-[var(--border)]" />
            <button
              type="button"
              aria-label="Alterar idioma"
              title="Alterar idioma"
              onClick={() =>
                void savePreferences({
                  language: preferences.language === 'pt-BR' ? 'en' : 'pt-BR',
                })
              }
              className="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-mono font-bold tracking-wider text-[var(--foreground)] transition-colors hover:bg-[var(--surface)] cursor-pointer"
            >
              {preferences.language === 'pt-BR' ? 'PT' : 'EN'}
            </button>
          </div>

          {/* Far Right: Standard Slide Drawer Close Icon */}
          <button
            type="button"
            onClick={onClose}
            aria-label={isEnglish ? 'Close panel' : 'Fechar painel'}
            title={isEnglish ? 'Close panel' : 'Fechar painel'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer active:scale-95"
          >
            <PanelRightClose size={19} />
          </button>
        </div>

        {/* Center / Body Section */}
        <div className="flex flex-1 flex-col items-center justify-center py-4">
          {/* User Avatar + Attached Notification Bell */}
          <div className="relative">
            <GoogleProfileAvatar
              profile={profile}
              name={name}
              size="lg"
              onClick={() => {
                onClose();
                onOpenProfile();
              }}
              title={isEnglish ? 'User Profile' : 'Perfil do Usuário'}
              className="shadow-sm cursor-pointer hover:ring-2 hover:ring-[var(--accent)]"
            />
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNotifications();
              }}
              aria-label={isEnglish ? 'Notifications' : 'Notificações'}
              title={isEnglish ? 'Notifications' : 'Notificações'}
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Bell size={12} className="text-[var(--foreground)]" />
              <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
            </button>
          </div>

          {/* User Name with Icon */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfile();
            }}
            title={isEnglish ? 'Edit Profile' : 'Editar Perfil'}
            className="mt-3 flex items-center justify-center gap-1.5 text-sm font-semibold tracking-tight text-[var(--foreground)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <User size={13} className="text-[var(--accent)]" />
            <span>{name}</span>
          </button>

          {/* User Location / Timezone */}
          <p className="mt-0.5 text-[10px] text-[var(--text-secondary)] font-mono">
            {profile?.birthCity || 'São Paulo'} · {profile?.timezone || 'UTC -3'}
          </p>

          {/* Wallet Credit Item */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWallet();
              }}
              title={isEnglish ? 'Open Wallet & Recharge' : 'Abrir Carteira & Recarregar'}
              className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--surface-2)] border border-transparent hover:border-[var(--border)] transition-all cursor-pointer shadow-2xs"
            >
              <CreditCard size={14} className="text-[var(--accent)]" />
              <span className="font-semibold text-[var(--foreground)]">◎ {credits}</span>
            </button>
          </div>

          {/* System Solutions & Screens Slide Navigation Bar (Clean, no heavy gray background or solid gray blocks) */}
          <div className="mt-8 w-full border-t border-[var(--border)] pt-5 flex flex-col items-center">
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
              {isEnglish ? 'SYSTEM WORKSPACES' : 'CENTRAIS DO SISTEMA'}
            </span>
            <div className="flex items-center justify-center gap-3">
              {/* 1. Daily Journal (Newspaper icon) */}
              <button
                type="button"
                title={isEnglish ? 'Daily Journal' : 'Daily Journal'}
                aria-label={isEnglish ? 'Daily Journal' : 'Daily Journal'}
                onClick={() => {
                  onClose();
                  onOpenDailyJournal?.();
                }}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
                  activeScreen === 'daily-journal'
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <Newspaper size={20} className="transition-transform group-hover:scale-110" />
                {activeScreen === 'daily-journal' && (
                  <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-[var(--accent)]" />
                )}
                <span className="sr-only">Daily Journal</span>
              </button>

              {/* 2. Chat com Orbie */}
              <button
                type="button"
                title={isEnglish ? 'Chat with Orbie' : 'Chat com Orbie'}
                aria-label={isEnglish ? 'Chat with Orbie' : 'Chat com Orbie'}
                onClick={() => {
                  onClose();
                  onOpenChat?.();
                }}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
                  activeScreen === 'chat'
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <Bot size={20} className="transition-transform group-hover:scale-110" />
                {activeScreen === 'chat' && (
                  <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-[var(--accent)]" />
                )}
                <span className="sr-only">Chat Orbie</span>
              </button>

              {/* 3. Neuroacústica Studio */}
              <button
                type="button"
                title={isEnglish ? 'Neuroacoustics Studio' : 'Estúdio de Neuroacústica'}
                aria-label={isEnglish ? 'Neuroacoustics Studio' : 'Estúdio de Neuroacústica'}
                onClick={() => {
                  onClose();
                  onOpenNeuroacustica?.();
                }}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
                  activeScreen === 'neuroacustica'
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <AudioLines size={20} className="transition-transform group-hover:scale-110" />
                {activeScreen === 'neuroacustica' && (
                  <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-[var(--accent)]" />
                )}
                <span className="sr-only">Neuroacústica</span>
              </button>

              {/* 4. Catálogo de Serviços & Produtos (ShoppingBag icon) */}
              <button
                type="button"
                title={isEnglish ? 'Services & Products Catalog' : 'Catálogo de Serviços e Produtos'}
                aria-label={isEnglish ? 'Services & Products Catalog' : 'Catálogo de Serviços e Produtos'}
                onClick={() => {
                  onClose();
                  onOpenCatalog?.();
                }}
                className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
                  activeScreen === 'catalog'
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <ShoppingBag size={20} className="transition-transform group-hover:scale-110" />
                {activeScreen === 'catalog' && (
                  <span className="absolute -bottom-1 h-1 w-3 rounded-full bg-[var(--accent)]" />
                )}
                <span className="sr-only">Catálogo de Serviços</span>
              </button>
            </div>
          </div>

          {/* Central Admin (Only visible if isAdmin) */}
          {isAdmin && (
            <div className="mt-6 w-full border-t border-[var(--border)] pt-4 px-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminCouponCenter?.();
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-mono font-bold bg-[var(--accent)] text-[var(--accent-foreground)] hover:opacity-90 transition-all cursor-pointer shadow-2xs active:scale-98"
              >
                <Shield size={14} />
                <span>{isEnglish ? 'Central Admin' : 'Central Admin'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom Sign Out Button */}
        <div className="border-t border-[var(--border)] pt-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSignOut?.();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-xs font-medium text-[var(--destructive)] transition-colors hover:bg-[var(--destructive)]/10 cursor-pointer"
          >
            <LogOut size={15} />
            <span>{isEnglish ? 'Sign Out' : 'Sair'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
