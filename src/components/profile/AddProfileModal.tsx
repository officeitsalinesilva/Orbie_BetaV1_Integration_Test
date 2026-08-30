import React, { useState } from 'react';
import { X, UserPlus, Calendar, Clock, MapPin, Sparkles, Heart, Users, Briefcase } from 'lucide-react';
import { AdditionalProfile } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddProfile: (data: Omit<AdditionalProfile, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>) => void;
  isEnglish?: boolean;
}

export function AddProfileModal({ isOpen, onClose, onAddProfile, isEnglish = false }: Props) {
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<'partner' | 'child' | 'business' | 'family' | 'other'>('partner');
  const [birthDay, setBirthDay] = useState('01');
  const [birthMonth, setBirthMonth] = useState('01');
  const [birthYear, setBirthYear] = useState('1995');
  const [birthHour, setBirthHour] = useState('12');
  const [birthMinute, setBirthMinute] = useState('00');
  const [birthCity, setBirthCity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthCity.trim()) return;

    onAddProfile({
      name: name.trim(),
      relation,
      birthDay,
      birthMonth,
      birthYear,
      birthHour,
      birthMinute,
      birthCity: birthCity.trim(),
    });

    onClose();
  };

  const relations = [
    { id: 'partner', label: isEnglish ? 'Partner / Spouse' : 'Parceiro(a) / Cônjuge', icon: Heart },
    { id: 'child', label: isEnglish ? 'Child / Son / Daughter' : 'Filho(a) / Criança', icon: Sparkles },
    { id: 'business', label: isEnglish ? 'Partner / Co-founder' : 'Sócio(a) / Negócios', icon: Briefcase },
    { id: 'family', label: isEnglish ? 'Family Member' : 'Familiar / Parente', icon: Users },
    { id: 'other', label: isEnglish ? 'Other Matrix' : 'Outro Perfil', icon: UserPlus },
  ] as const;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--surface-2)]/40 shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              {isEnglish ? 'Add Additional Profile' : 'Adicionar Perfil Adicional'}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isEnglish ? 'Close' : 'Fechar'}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          <p className="text-[11px] text-[var(--text-secondary)] font-mono">
            {isEnglish
              ? 'Create secondary profiles for partners, children, or associates to generate synastries and custom library dossiers.'
              : 'Crie perfis complementares para parceiros, filhos ou sócios para gerar sinastrias e bibliotecas de análises dedicadas.'}
          </p>

          {/* Nome */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {isEnglish ? 'Full Name' : 'Nome Completo'} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEnglish ? 'e.g. Lucas Silva' : 'ex: Lucas Silva'}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Relação */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {isEnglish ? 'Relationship Type' : 'Tipo de Relação'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {relations.map((rel) => {
                const Icon = rel.icon;
                const isSelected = relation === rel.id;
                return (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => setRelation(rel.id as any)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer font-mono text-[11px] ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--surface-2)] text-[var(--foreground)] font-bold shadow-2xs'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]/50'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-[var(--accent)]' : 'opacity-60'} />
                    <span className="truncate">{rel.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              <Calendar size={12} />
              <span>{isEnglish ? 'Birth Date' : 'Data de Nascimento'} *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                max="31"
                required
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value.padStart(2, '0'))}
                placeholder="DD"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="number"
                min="1"
                max="12"
                required
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value.padStart(2, '0'))}
                placeholder="MM"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="number"
                min="1900"
                max="2030"
                required
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="AAAA"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {/* Horário */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              <Clock size={12} />
              <span>{isEnglish ? 'Birth Time (HH:MM)' : 'Horário de Nascimento (HH:MM)'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={birthHour}
                onChange={(e) => setBirthHour(e.target.value.padStart(2, '0'))}
                placeholder="HH"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={birthMinute}
                onChange={(e) => setBirthMinute(e.target.value.padStart(2, '0'))}
                placeholder="MM"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {/* Cidade de Nascimento */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              <MapPin size={12} />
              <span>{isEnglish ? 'Birth City & State' : 'Cidade e Estado de Nascimento'} *</span>
            </label>
            <input
              type="text"
              required
              value={birthCity}
              onChange={(e) => setBirthCity(e.target.value)}
              placeholder={isEnglish ? 'e.g. São Paulo, SP' : 'ex: São Paulo, SP'}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] py-2.5 font-mono font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <UserPlus size={14} />
              <span>{isEnglish ? 'Create Profile & Library' : 'Criar Perfil e Gerar Biblioteca'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
