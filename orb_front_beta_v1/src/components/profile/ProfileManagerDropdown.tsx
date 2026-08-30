import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  ChevronDown,
  Plus,
  X,
  Settings,
  User,
  Building2,
  Trash2,
  Check,
  Bell,
  Sparkles,
  CalendarPlus,
  UserPlus,
  Sliders,
  Heart,
  Briefcase,
  Flame,
  Award,
  Compass,
  ShieldCheck,
  Moon,
  Sun,
  Star,
  Crown,
  Globe,
} from 'lucide-react';
import { SelectedScope } from '../../context/OrbContext';
import { AdditionalProfile, RegisteredEvent, OrbProfile } from '../../types';
import { getProfileEventIcon } from './AddOrEditProfileEventModal';

interface Props {
  selectedScope: SelectedScope;
  onSelectScope: (scope: SelectedScope) => void;
  matrixProfile: OrbProfile | null;
  additionalProfiles: AdditionalProfile[];
  registeredEvents: RegisteredEvent[];
  onOpenAddModal: (type?: 'person' | 'event') => void;
  onEditProfile: (profile: AdditionalProfile) => void;
  onEditEvent: (event: RegisteredEvent) => void;
  onDeleteProfile: (id: string) => void;
  onDeleteEvent: (id: string) => void;
  isEnglish?: boolean;
}

export function ProfileManagerDropdown({
  selectedScope,
  onSelectScope,
  matrixProfile,
  additionalProfiles,
  registeredEvents,
  onOpenAddModal,
  onEditProfile,
  onEditEvent,
  onDeleteProfile,
  onDeleteEvent,
  isEnglish = false,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const isSecondaryActive = selectedScope.type !== 'matrix';

  // Obter detalhes do escopo ativo
  const activeLabel = (() => {
    if (selectedScope.type === 'profile') {
      const p = additionalProfiles.find((item) => item.id === selectedScope.id);
      return {
        title: p?.name || p?.fullName || 'Perfil Adicional',
        subtitle: p?.relation || p?.relationship || 'Pessoa',
        icon: getProfileEventIcon(p?.icon, false),
        type: 'profile',
        item: p,
      };
    }
    if (selectedScope.type === 'event') {
      const e = registeredEvents.find((item) => item.id === selectedScope.id);
      return {
        title: e?.title || 'Evento Cadastrado',
        subtitle: e?.category || 'Evento',
        icon: getProfileEventIcon(e?.icon, true),
        type: 'event',
        item: e,
      };
    }
    return {
      title: matrixProfile?.preferredName || matrixProfile?.fullName || (isEnglish ? 'Matrix Profile' : 'Perfil Matriz'),
      subtitle: isEnglish ? 'Main Profile' : 'Perfil Padrão',
      icon: Star,
      type: 'matrix',
      item: null,
    };
  })();

  const ActiveIcon = activeLabel.icon;

  const handleEditActive = () => {
    if (selectedScope.type === 'profile') {
      const p = additionalProfiles.find((item) => item.id === selectedScope.id);
      if (p) onEditProfile(p);
    } else if (selectedScope.type === 'event') {
      const e = registeredEvents.find((item) => item.id === selectedScope.id);
      if (e) onEditEvent(e);
    }
  };

  const handleCloseSelection = () => {
    onSelectScope({ type: 'matrix' });
  };

  return (
    <div className="space-y-2 border-y border-[var(--border)] py-3 relative" ref={dropdownRef}>
      {/* Linha de Controles: Botão Dropdown "Gerenciador de Perfil" com X integrado para fechar seleção */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative inline-flex items-center">
          {/* Botão Dropdown Gerenciador de Perfil */}
          <div className="flex items-center">
            <button
              type="button"
              id="btn-profile-manager-dropdown"
              onClick={() => setDropdownOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-mono transition-all cursor-pointer border shadow-2xs ${
                isSecondaryActive
                  ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent font-bold rounded-l-xl'
                  : 'bg-[var(--surface-2)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--surface-2)]/80 rounded-xl'
              }`}
            >
              <Users size={15} className={isSecondaryActive ? 'text-[var(--background)]' : 'text-[var(--accent)]'} />
              <div className="flex items-center gap-1.5 text-left">
                <span className="font-semibold">
                  {isEnglish ? 'Profile Manager:' : 'Gerenciador de Perfil:'}
                </span>
                <span className="opacity-90 max-w-[130px] sm:max-w-[200px] truncate">
                  {activeLabel.title}
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* 'X' integrado no botão de gerenciador para fechar a seleção e retornar à tela padrão */}
            {isSecondaryActive && (
              <button
                type="button"
                id="btn-clear-selection-x"
                onClick={handleCloseSelection}
                title={isEnglish ? 'Clear selection and return to default profile' : 'Fechar seleção e voltar ao perfil padrão'}
                className="flex items-center justify-center px-2 py-2 rounded-r-xl border-y border-r border-transparent bg-[var(--foreground)] hover:bg-[var(--foreground)]/80 text-[var(--background)] hover:text-red-300 transition-colors cursor-pointer border-l border-[var(--background)]/20"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* Dropdown Menu Flutuante */}
          {dropdownOpen && (
            <div
              id="profile-manager-dropdown-menu"
              className="absolute left-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[460px]"
            >
              {/* Header do Dropdown */}
              <div className="p-3.5 border-b border-[var(--border)] bg-[var(--surface-2)]/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Sliders size={14} className="text-[var(--accent)]" />
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {isEnglish ? 'Select Profile or Event' : 'Selecionar Perfil ou Evento'}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {1 + additionalProfiles.length + registeredEvents.length} {isEnglish ? 'Total' : 'Total'}
                </span>
              </div>

              {/* Lista com scroll */}
              <div className="p-2 overflow-y-auto space-y-3 flex-1 text-xs font-mono">
                {/* 1. Perfil Padrão / Matriz */}
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)] px-2">
                    {isEnglish ? 'Default Main Profile' : 'Perfil Principal Padrão'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectScope({ type: 'matrix' });
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer text-left border ${
                      selectedScope.type === 'matrix'
                        ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent font-bold shadow-2xs'
                        : 'bg-[var(--surface-2)]/60 text-[var(--foreground)] border-transparent hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          selectedScope.type === 'matrix'
                            ? 'bg-[var(--background)]/20 text-[var(--background)]'
                            : 'bg-[var(--accent)]/15 text-[var(--accent)]'
                        }`}
                      >
                        <Star size={14} />
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">
                          {matrixProfile?.preferredName || matrixProfile?.fullName || 'Perfil Matriz'}
                        </p>
                        <p
                          className={`text-[10px] ${
                            selectedScope.type === 'matrix' ? 'opacity-80' : 'text-[var(--text-secondary)]'
                          }`}
                        >
                          {isEnglish ? 'Main Sovereign Matrix' : 'Matriz Soberana (Padrão)'}
                        </p>
                      </div>
                    </div>

                    {selectedScope.type === 'matrix' && <Check size={16} className="text-[var(--background)] shrink-0" />}
                  </button>
                </div>

                {/* 2. Perfis Adicionais (Pessoas) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)]">
                      {isEnglish ? 'Additional Profiles (People)' : 'Perfis Adicionais (Pessoas)'}
                    </span>
                    <span className="text-[9px] text-[var(--text-tertiary)]">{additionalProfiles.length}</span>
                  </div>

                  {additionalProfiles.length === 0 ? (
                    <p className="text-[10px] text-[var(--text-secondary)] px-2 py-1 italic">
                      {isEnglish ? 'No additional profiles registered.' : 'Nenhum perfil adicional cadastrado.'}
                    </p>
                  ) : (
                    additionalProfiles.map((p) => {
                      const isSelected = selectedScope.type === 'profile' && selectedScope.id === p.id;
                      const ItemIcon = getProfileEventIcon(p.icon, false);
                      return (
                        <div
                          key={p.id}
                          className={`group flex items-center justify-between p-2 rounded-xl transition-all border ${
                            isSelected
                              ? 'bg-[var(--foreground)] text-[var(--background)] border-transparent font-bold shadow-2xs'
                              : 'bg-[var(--surface-2)]/60 text-[var(--foreground)] border-transparent hover:bg-[var(--surface-2)]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScope({ type: 'profile', id: p.id });
                              setDropdownOpen(false);
                            }}
                            className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                          >
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${
                                isSelected
                                  ? 'bg-[var(--background)]/20 text-[var(--background)]'
                                  : 'bg-[var(--surface)] text-[var(--accent)]'
                              }`}
                            >
                              <ItemIcon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold truncate leading-tight">{p.name || p.fullName}</p>
                                {p.notifyEnabled && (
                                  <span
                                    title={isEnglish ? 'Notifications enabled' : 'Notificações ativas'}
                                    className={`p-0.5 rounded shrink-0 ${
                                      isSelected ? 'text-[var(--background)]' : 'text-[var(--accent)]'
                                    }`}
                                  >
                                    <Bell size={10} />
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[10px] truncate ${
                                  isSelected ? 'opacity-80' : 'text-[var(--text-secondary)]'
                                }`}
                              >
                                {p.relation || p.relationship || 'Pessoa'} · {p.birthCity}
                              </p>
                            </div>
                          </button>

                          {/* Ações: Configurações e Excluir */}
                          <div className="flex items-center gap-1 pl-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditProfile(p);
                                setDropdownOpen(false);
                              }}
                              title={isEnglish ? 'Edit profile data & notifications' : 'Editar dados e notificações'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSelected
                                  ? 'hover:bg-[var(--background)]/20 text-[var(--background)]'
                                  : 'hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <Settings size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProfile(p.id);
                              }}
                              title={isEnglish ? 'Remove profile' : 'Excluir perfil'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSelected
                                  ? 'hover:bg-[var(--background)]/20 text-red-300'
                                  : 'hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-red-400'
                              }`}
                            >
                              <Trash2 size={13} />
                            </button>

                            {isSelected && <Check size={15} className="text-[var(--background)] ml-1" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 3. Eventos Registrados */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 pt-1">
                    <span className="text-[9px] uppercase font-bold text-[var(--text-tertiary)]">
                      {isEnglish ? 'Registered Events' : 'Eventos Registrados'}
                    </span>
                    <span className="text-[9px] text-[var(--text-tertiary)]">{registeredEvents.length}</span>
                  </div>

                  {registeredEvents.length === 0 ? (
                    <p className="text-[10px] text-[var(--text-secondary)] px-2 py-1 italic">
                      {isEnglish ? 'No events registered.' : 'Nenhum evento registrado.'}
                    </p>
                  ) : (
                    registeredEvents.map((ev) => {
                      const isSelected = selectedScope.type === 'event' && selectedScope.id === ev.id;
                      const ItemIcon = getProfileEventIcon(ev.icon, true);
                      return (
                        <div
                          key={ev.id}
                          className={`group flex items-center justify-between p-2 rounded-xl transition-all border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-transparent font-bold shadow-2xs'
                              : 'bg-[var(--surface-2)]/60 text-[var(--foreground)] border-transparent hover:bg-[var(--surface-2)]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectScope({ type: 'event', id: ev.id });
                              setDropdownOpen(false);
                            }}
                            className="flex items-center gap-2.5 flex-1 min-w-0 text-left cursor-pointer"
                          >
                            <div
                              className={`p-1.5 rounded-lg shrink-0 ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-[var(--surface)] text-blue-400'
                              }`}
                            >
                              <ItemIcon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="font-semibold truncate leading-tight">{ev.title}</p>
                                {ev.notifyEnabled && (
                                  <span
                                    title={isEnglish ? 'Notifications enabled' : 'Notificações ativas'}
                                    className={`p-0.5 rounded shrink-0 ${
                                      isSelected ? 'text-white' : 'text-blue-400'
                                    }`}
                                  >
                                    <Bell size={10} />
                                  </span>
                                )}
                              </div>
                              <p
                                className={`text-[10px] truncate ${
                                  isSelected ? 'opacity-80' : 'text-[var(--text-secondary)]'
                                }`}
                              >
                                {ev.category || 'Evento'} · {ev.eventDay}/{ev.eventMonth}/{ev.eventYear}
                              </p>
                            </div>
                          </button>

                          {/* Ações: Configurações e Excluir */}
                          <div className="flex items-center gap-1 pl-2 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEvent(ev);
                                setDropdownOpen(false);
                              }}
                              title={isEnglish ? 'Edit event data & notifications' : 'Editar dados e notificações'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSelected
                                  ? 'hover:bg-white/20 text-white'
                                  : 'hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                              }`}
                            >
                              <Settings size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteEvent(ev.id);
                              }}
                              title={isEnglish ? 'Remove event' : 'Excluir evento'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isSelected
                                  ? 'hover:bg-white/20 text-red-200'
                                  : 'hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-red-400'
                              }`}
                            >
                              <Trash2 size={13} />
                            </button>

                            {isSelected && <Check size={15} className="text-white ml-1" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Rodapé do Dropdown com atalhos para Adicionar */}
              <div className="p-2.5 border-t border-[var(--border)] bg-[var(--surface-2)]/40 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenAddModal('person');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[11px] font-mono font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <UserPlus size={13} className="text-[var(--accent)]" />
                  <span>{isEnglish ? '+ Person' : '+ Pessoa'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenAddModal('event');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[11px] font-mono font-semibold text-[var(--foreground)] transition-colors cursor-pointer"
                >
                  <CalendarPlus size={13} className="text-blue-400" />
                  <span>{isEnglish ? '+ Event' : '+ Evento'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Banner / Marcação de Sessão Ativa (Logo após o botão de gerenciador) com ícone de configuração no lugar do título 'sessões dedicadas' */}
      {isSecondaryActive && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-2)]/50 border border-[var(--border)] text-[11px] font-mono animate-in fade-in duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <ActiveIcon size={14} className={selectedScope.type === 'event' ? 'text-blue-400' : 'text-[var(--accent)]'} />
            <span className="text-[var(--text-secondary)]">{isEnglish ? 'Active Session:' : 'Sessão Ativa:'}</span>
            <span className="font-bold text-[var(--foreground)] truncate">{activeLabel.title}</span>
            <span className="text-[10px] text-[var(--text-tertiary)] hidden sm:inline">
              ({activeLabel.subtitle})
            </span>
            {activeLabel.item && 'notifyEnabled' in activeLabel.item && activeLabel.item.notifyEnabled && (
              <span className="flex items-center gap-1 text-[10px] text-[var(--accent)] font-semibold shrink-0 ml-1">
                <Bell size={11} />
                <span className="hidden sm:inline">{isEnglish ? 'Alerts ON' : 'Notificações'}</span>
              </span>
            )}
          </div>

          {/* Ícone/Botão de Configuração do Perfil Adicional / Evento no lugar de 'Sessões Dedicadas' */}
          <button
            type="button"
            id="btn-edit-active-profile"
            onClick={handleEditActive}
            title={isEnglish ? 'Edit active profile/event settings & notifications' : 'Editar dados e notificações deste perfil/evento'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--border)] text-[var(--foreground)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Settings size={13} className="text-[var(--accent)]" />
            <span>{isEnglish ? 'Settings' : 'Configurações'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
