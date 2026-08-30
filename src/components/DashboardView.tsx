import React, { useState } from 'react';
import {
  User,
  CreditCard,
  Bell,
  HardDrive,
  LogOut,
  X,
  Compass,
  ChevronRight,
  ChevronLeft,
  Calendar,
  type LucideIcon,
} from 'lucide-react';
import { OrbBrand } from './OrbBrand';
import { OrbPreferenceControls } from './OrbPreferenceControls';
import { useOrb } from '../context/OrbContext';
import { energyLevels } from '../constants/energyLevels';
import { EnergyLevel } from '../types';

const weekdayPt = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
][new Date().getDay()];

const weekdayEn = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
][new Date().getDay()];

type Props = {
  onOpenProfile: () => void;
  onOpenWallet: () => void;
  onOpenNotifications: () => void;
  onSignOut: () => void;
};

export function DashboardView({
  onOpenProfile,
  onOpenWallet,
  onOpenNotifications,
  onSignOut,
}: Props) {
  const { profile, preferences } = useOrb();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<EnergyLevel | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const isEnglish = preferences.language === 'en';
  const name = profile?.preferredName || profile?.fullName.split(' ')[0] || 'Orb';
  const avatarLetter = (name || 'O').slice(0, 1).toUpperCase();

  const copy = isEnglish
    ? {
        data: 'Data',
        today: 'Your awareness today',
        alchemy: 'Alchemy indices today',
        presence: 'Productivity panorama today',
        projection: 'Projection of the day',
        profile: 'Profile',
        wallet: 'Wallet',
        notifications: 'Notifications',
        backup: 'Data backup',
        menu: 'Menu',
        logout: 'Log out',
        weekday: weekdayEn,
      }
    : {
        data: 'Data',
        today: 'Sua consciência hoje',
        alchemy: 'Índices alquímicos hoje',
        presence: 'Panorama de produtividade hoje',
        projection: 'Projeção do dia',
        profile: 'Perfil',
        wallet: 'Carteira',
        notifications: 'Notificações',
        backup: 'Backup de dados',
        menu: 'Menu',
        logout: 'Sair',
        weekday: weekdayPt,
      };

  const tabs = [
    { id: 0, label: isEnglish ? 'Awareness' : 'Consciência', title: copy.today },
    { id: 1, label: isEnglish ? 'Alchemy' : 'Alquimia', title: copy.alchemy },
    { id: 2, label: isEnglish ? 'Presence' : 'Presença', title: copy.presence },
    { id: 3, label: isEnglish ? 'Projection' : 'Projeção', title: copy.projection },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md px-6 py-3 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <OrbBrand compact />
            <span className="hidden sm:inline-block text-[11px] font-mono tracking-widest text-[var(--text-secondary)] uppercase">
              ORB / STAGE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <OrbPreferenceControls compact />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={copy.menu}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-[var(--accent-foreground)] transition-transform hover:scale-105 active:scale-95 shadow-sm"
            >
              {avatarLetter}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-2xl px-6 pt-6 sm:px-8">
        {/* Section Heading */}
        <div className="flex items-end justify-between border-b border-[var(--border)] pb-4">
          <div>
            <span className="block text-[10px] font-semibold tracking-[0.2em] text-[var(--text-secondary)]">
              ORB / STAGE
            </span>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[var(--foreground)]">
              {copy.data}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
            <Calendar size={13} />
            <span className="capitalize">{copy.weekday}</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-4 flex border-b border-[var(--border)] overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--foreground)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--foreground)]'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />
              )}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium text-[var(--text-secondary)]">
          {tabs[activeTab].title}
        </p>

        {/* Active Card View */}
        <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 transition-all">
          {activeTab === 0 && (
            <EnergyTab
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
              isEnglish={isEnglish}
            />
          )}

          {activeTab === 1 && <AlchemyTab isEnglish={isEnglish} />}

          {activeTab === 2 && <PresenceTab isEnglish={isEnglish} />}

          {activeTab === 3 && <ProjectionTab isEnglish={isEnglish} />}
        </div>

        {/* Bottom Pagination Controls */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={activeTab === 0}
            onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            <span>{isEnglish ? 'Previous' : 'Anterior'}</span>
          </button>

          <div className="flex gap-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`h-1.5 rounded-full transition-all ${
                  activeTab === tab.id ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-[var(--border)]'
                }`}
                aria-label={`Go to tab ${tab.label}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={activeTab === tabs.length - 1}
            onClick={() => setActiveTab((prev) => Math.min(tabs.length - 1, prev + 1))}
            className="flex items-center gap-1 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--foreground)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span>{isEnglish ? 'Next' : 'Próximo'}</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </main>

      {/* Side Menu Drawer Modal */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div
            className="fixed inset-0"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-10 flex h-full w-full max-w-xs flex-col justify-between border-l border-[var(--border)] bg-[var(--background)] p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                <span className="font-display text-xl font-bold text-[var(--foreground)]">
                  {copy.menu}
                </span>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full p-1 text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 mb-6">
                <span className="text-[11px] font-mono tracking-wider uppercase text-[var(--text-secondary)]">
                  {name}
                </span>
              </div>

              <nav className="space-y-1">
                <MenuButton
                  label={copy.profile}
                  icon={User}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProfile();
                  }}
                />
                <MenuButton
                  label={copy.wallet}
                  icon={CreditCard}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenWallet();
                  }}
                />
                <MenuButton
                  label={copy.notifications}
                  icon={Bell}
                  badge
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenNotifications();
                  }}
                />
                <MenuButton
                  label={copy.backup}
                  icon={HardDrive}
                  onClick={() => {
                    setMenuOpen(false);
                    onOpenProfile();
                  }}
                />
              </nav>
            </div>

            <div className="border-t border-[var(--border)] pt-4">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--destructive)] transition-colors hover:bg-[var(--destructive)]/10"
              >
                <LogOut size={16} />
                <span>{copy.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuButton({
  label,
  icon: Icon,
  badge,
  onClick,
}: {
  label: string;
  icon: LucideIcon;
  badge?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className="text-[var(--accent)]" />
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && <span className="h-2 w-2 rounded-full bg-[var(--destructive)]" />}
        <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
      </div>
    </button>
  );
}

/* ==================== TAB COMPONENTS ==================== */

function EnergyTab({
  selectedLevel,
  onSelectLevel,
  isEnglish,
}: {
  selectedLevel: EnergyLevel | null;
  onSelectLevel: (level: EnergyLevel | null) => void;
  isEnglish: boolean;
}) {
  const orderedLevels = [...energyLevels].reverse();

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
            {isEnglish ? 'Logarithmic Scale' : 'Escala Logarítmica'}
          </span>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {isEnglish ? 'Level of Consciousness' : 'Nível de Consciência'}
          </h2>
        </div>
        <div className="text-right">
          <span className="font-display text-3xl sm:text-4xl font-extrabold text-[var(--accent)]">
            350
          </span>
          <span className="block text-[11px] font-medium text-[var(--text-secondary)]">
            {isEnglish ? 'Acceptance' : 'Aceitação'}
          </span>
        </div>
      </div>

      {/* Logarithmic Scale List */}
      <div className="relative mt-6 max-h-72 overflow-y-auto pr-2">
        <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-[var(--border)]" />
        <div className="space-y-1.5">
          {orderedLevels.map((lvl, index) => {
            const isCurrent = lvl.value === '350';
            const isSelected = selectedLevel?.value === lvl.value;
            const dotColor =
              index < 4
                ? 'bg-[var(--silver)]'
                : index < 10
                ? 'bg-[var(--accent)]'
                : 'bg-[var(--text-secondary)]';

            return (
              <button
                key={lvl.value}
                type="button"
                onClick={() => onSelectLevel(isSelected ? null : lvl)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-[var(--surface-2)] font-semibold text-[var(--foreground)]'
                    : 'hover:bg-[var(--surface-2)] text-[var(--text-secondary)]'
                }`}
              >
                <div
                  className={`relative z-10 h-2.5 w-2.5 rounded-full border-2 border-[var(--background)] ${dotColor} ${
                    isCurrent ? 'ring-2 ring-[var(--accent)] ring-offset-1' : ''
                  }`}
                />
                <span className="w-10 font-mono text-[11px] font-semibold text-[var(--foreground)]">
                  {lvl.value}
                </span>
                <span className="flex-1 truncate">{lvl.name}</span>
                {isCurrent && (
                  <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-semibold text-[var(--accent-foreground)]">
                    {isEnglish ? 'Current' : 'Atual'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected level explanation detail card */}
      {selectedLevel ? (
        <div className="mt-6 border-t border-[var(--border)] pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-sm font-bold text-[var(--accent)]">
                {selectedLevel.value}
              </span>
              <h3 className="text-base font-semibold text-[var(--foreground)]">
                {selectedLevel.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectLevel(null)}
              className="text-[var(--text-tertiary)] hover:text-[var(--foreground)]"
            >
              <X size={16} />
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--text-secondary)]">
            {selectedLevel.description}
          </p>
        </div>
      ) : (
        <div className="mt-6 border-t border-[var(--border)] pt-4">
          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {isEnglish
              ? 'Your awareness today is calibrated to 350 (Acceptance). The reading combines your personal presence, intent, and subtle daily alignment.'
              : 'A leitura combina presença, intenção e os sinais que atravessam o seu dia. Clique em qualquer nível para ver detalhes.'}
          </p>
        </div>
      )}
    </div>
  );
}

function AlchemyTab({ isEnglish }: { isEnglish: boolean }) {
  const metrics = [
    { label: isEnglish ? 'Water' : 'Água', value: 64, desc: isEnglish ? 'Emotional flow & adaptability' : 'Fluxo emocional e adaptabilidade' },
    { label: isEnglish ? 'Air' : 'Ar', value: 48, desc: isEnglish ? 'Clarity of mind & communication' : 'Clareza mental e comunicação' },
    { label: isEnglish ? 'Earth' : 'Terra', value: 71, desc: isEnglish ? 'Grounded stability & execution' : 'Estabilidade, foco e execução' },
    { label: isEnglish ? 'Fire' : 'Fogo', value: 56, desc: isEnglish ? 'Drive, will & vitality' : 'Vontade, impulso e vitalidade' },
  ];

  return (
    <div>
      <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
        {isEnglish ? 'Elemental Alchemy' : 'Alquimia Elemental'}
      </span>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {isEnglish ? 'Elemental Indices' : 'Níveis Alquímicos'}
      </h2>

      <div className="mt-6 space-y-5">
        {metrics.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[var(--foreground)] font-semibold">{item.label}</span>
              <span className="font-mono text-[var(--text-secondary)]">{item.value}%</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-[var(--border)] pt-4">
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          {isEnglish
            ? 'A snapshot of how you distribute energy, movement, and structural stability throughout your day.'
            : 'Um retrato de como você distribui energia, movimento e estabilidade ao longo do dia.'}
        </p>
      </div>
    </div>
  );
}

function PresenceTab({ isEnglish }: { isEnglish: boolean }) {
  const metrics = [
    { label: isEnglish ? 'Focus' : 'Foco', value: 72 },
    { label: isEnglish ? 'Rest' : 'Descanso', value: 61 },
    { label: isEnglish ? 'Physical' : 'Físico', value: 83 },
  ];

  return (
    <div>
      <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
        {isEnglish ? 'Presence Panorama' : 'Panorama de Presença'}
      </span>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {isEnglish ? 'Daily Presence' : 'Panorama de Produtividade'}
      </h2>

      {/* Discs / Gauges */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {metrics.map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] shadow-xs">
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[var(--surface-2)]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[var(--accent)] transition-all duration-700"
                  strokeDasharray={`${item.value}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="font-mono text-sm font-bold text-[var(--foreground)]">
                {item.value}%
              </span>
            </div>
            <span className="mt-2 text-xs font-medium text-[var(--text-secondary)]">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Guidance Callout */}
      <div className="mt-8 flex items-start gap-3 rounded-lg border-l-2 border-[var(--accent)] bg-[var(--surface-2)]/60 p-3.5">
        <Compass size={18} className="shrink-0 text-[var(--accent)] mt-0.5" />
        <p className="text-xs font-medium leading-relaxed text-[var(--foreground)]">
          {isEnglish
            ? 'Today, reserve 30 min for intentional reading and physical movement.'
            : 'Hoje, reserve 30 min para leitura e movimento.'}
        </p>
      </div>

      <div className="mt-6 border-t border-[var(--border)] pt-4">
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          {isEnglish
            ? 'Focus, rest, and body unified in a single, balanced productivity panorama.'
            : 'Foco, descanso e corpo em um mesmo panorama de produtividade.'}
        </p>
      </div>
    </div>
  );
}

function ProjectionTab({ isEnglish }: { isEnglish: boolean }) {
  return (
    <div>
      <span className="text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
        {isEnglish ? 'Rhythm of the Day' : 'Ritmo do Dia'}
      </span>
      <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {isEnglish ? 'Daily Projection' : 'Projeção do Dia'}
      </h2>

      <div className="mt-6 flex items-baseline justify-between">
        <span className="font-display text-2xl font-bold text-[var(--foreground)]">
          {isEnglish ? 'Favorable' : 'A favor'}
        </span>
        <span className="font-mono text-3xl font-extrabold text-[var(--accent)]">
          78%
        </span>
      </div>

      {/* Mood Progress Scale */}
      <div className="relative mt-3 h-3 w-full rounded-full bg-[var(--surface-2)]">
        <div
          className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
          style={{ width: '78%' }}
        />
        <div
          className="absolute top-1/2 -mt-2.5 h-5 w-5 -ml-2.5 rounded-full border-2 border-[var(--accent)] bg-[var(--background)] shadow-sm"
          style={{ left: '78%' }}
        />
      </div>

      <div className="mt-8 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
        <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
          {isEnglish
            ? 'The day yields optimal results between 09:30 and 12:00. Protect this interval from external interruptions.'
            : 'O dia rende melhor entre 09:30 e 12:00. Proteja esse intervalo de interrupções.'}
        </p>
      </div>
    </div>
  );
}
