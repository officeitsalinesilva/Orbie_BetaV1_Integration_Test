import React, { useState } from 'react';
import { X, CalendarPlus, Calendar, Clock, MapPin, Building2, Heart, Award, Flag, Sparkles } from 'lucide-react';
import { RegisteredEvent } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddEvent: (data: Omit<RegisteredEvent, 'id' | 'createdAt' | 'completeness' | 'unlockedItems'>) => void;
  isEnglish?: boolean;
}

export function AddEventModal({ isOpen, onClose, onAddEvent, isEnglish = false }: Props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'business' | 'marriage' | 'relocation' | 'milestone' | 'historical' | 'other'>('business');
  const [eventDay, setEventDay] = useState('01');
  const [eventMonth, setEventMonth] = useState('01');
  const [eventYear, setEventYear] = useState('2024');
  const [eventHour, setEventHour] = useState('10');
  const [eventMinute, setEventMinute] = useState('00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim()) return;

    onAddEvent({
      title: title.trim(),
      category,
      eventDay,
      eventMonth,
      eventYear,
      eventHour,
      eventMinute,
      location: location.trim(),
      description: description.trim() || undefined,
    });

    onClose();
  };

  const categories = [
    { id: 'business', label: isEnglish ? 'Business / Company' : 'Empresa / Negócio', icon: Building2 },
    { id: 'marriage', label: isEnglish ? 'Marriage / Partnership' : 'Casamento / União', icon: Heart },
    { id: 'milestone', label: isEnglish ? 'Key Milestone / Launch' : 'Marco / Lançamento', icon: Award },
    { id: 'relocation', label: isEnglish ? 'Move / Relocation' : 'Mudança / Viagem', icon: Flag },
    { id: 'historical', label: isEnglish ? 'Historic / Other' : 'Histórico / Outro', icon: Sparkles },
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
            <CalendarPlus size={18} className="text-[var(--accent)]" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">
              {isEnglish ? 'Add Event Matrix' : 'Adicionar Evento / Apuração'}
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
              ? 'Register historical dates, company foundations, launches or strategic milestones to calculate custom electional charts and temporal libraries.'
              : 'Registre datas de fundação de empresas, contratos, casamentos ou marcos temporais para gerar mapas eletivos e bibliotecas de apuração.'}
          </p>

          {/* Título do Evento */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {isEnglish ? 'Event / Milestone Name' : 'Nome do Evento / Marco'} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isEnglish ? 'e.g. Foundation of Orb Co.' : 'ex: Fundação da Orb Tech'}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {isEnglish ? 'Event Category' : 'Categoria do Evento'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer font-mono text-[11px] ${
                      isSelected
                        ? 'border-[var(--accent)] bg-[var(--surface-2)] text-[var(--foreground)] font-bold shadow-2xs'
                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-2)]/50'
                    }`}
                  >
                    <Icon size={14} className={isSelected ? 'text-[var(--accent)]' : 'opacity-60'} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data do Evento */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              <Calendar size={12} />
              <span>{isEnglish ? 'Event Date' : 'Data do Evento'} *</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                min="1"
                max="31"
                required
                value={eventDay}
                onChange={(e) => setEventDay(e.target.value.padStart(2, '0'))}
                placeholder="DD"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="number"
                min="1"
                max="12"
                required
                value={eventMonth}
                onChange={(e) => setEventMonth(e.target.value.padStart(2, '0'))}
                placeholder="MM"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="number"
                min="1800"
                max="2050"
                required
                value={eventYear}
                onChange={(e) => setEventYear(e.target.value)}
                placeholder="AAAA"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {/* Horário */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              <Clock size={12} />
              <span>{isEnglish ? 'Event Time (HH:MM)' : 'Horário do Evento (HH:MM)'}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={eventHour}
                onChange={(e) => setEventHour(e.target.value.padStart(2, '0'))}
                placeholder="HH"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={eventMinute}
                onChange={(e) => setEventMinute(e.target.value.padStart(2, '0'))}
                placeholder="MM"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-xs font-mono text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
              />
            </div>
          </div>

          {/* Local / Cidade */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              <MapPin size={12} />
              <span>{isEnglish ? 'Event Location / City' : 'Local / Cidade do Evento'} *</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={isEnglish ? 'e.g. São Paulo, SP' : 'ex: São Paulo, SP'}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <label className="block font-mono font-semibold text-[var(--text-secondary)] uppercase text-[10px]">
              {isEnglish ? 'Context / Notes' : 'Contexto / Observações'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isEnglish ? 'Details about the event significance...' : 'Detalhes sobre a relevância do evento...'}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] text-[var(--background)] py-2.5 font-mono font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
            >
              <CalendarPlus size={14} />
              <span>{isEnglish ? 'Register Event & Library' : 'Registrar Evento e Criar Biblioteca'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
