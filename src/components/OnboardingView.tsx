import React, { useState, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Check, AlertCircle, Edit2, CheckCircle2 } from 'lucide-react';
import { OrbBrand } from './OrbBrand';
import { ProgressRail } from './ProgressRail';
import { useOrb } from '../context/OrbContext';
import { OrbLanguage, OrbProfile, OrbTheme } from '../types';

const TOTAL_STEPS = 6;
const currentYear = new Date().getFullYear();

type Props = {
  onComplete: () => void;
  onBackToLogin: () => void;
};

export function OnboardingView({ onComplete, onBackToLogin }: Props) {
  const { profile, preferences, saveProfile } = useOrb();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [draft, setDraft] = useState<OrbProfile>(
    profile ?? {
      fullName: 'Aline Silva',
      preferredName: 'Aline',
      birthDay: '14',
      birthMonth: '06',
      birthYear: '1994',
      birthHour: '09',
      birthMinute: '30',
      noExactTime: false,
      birthCountry: 'Brasil',
      birthState: 'São Paulo',
      birthCity: 'São Paulo',
      timezone: 'UTC -3 (Brasília)',
      theme: preferences.theme,
      language: preferences.language,
      dailySynthesis: true,
      synthesisHour: '08:00',
    }
  );

  const isEnglish = preferences.language === 'en';

  const title = useMemo(() => {
    const titlesPt = [
      ['Como devemos chamar você?', 'Usado exclusivamente para sua análise.'],
      ['Quando você nasceu?', 'A data dá contexto para a sua leitura individual.'],
      ['Que horas?', 'O horário refina a precisão da sua análise.'],
      ['Onde você nasceu?', 'Usaremos o local apenas para calcular o fuso correto.'],
      ['Suas preferências', 'Você pode ajustar tudo isso depois.'],
      ['Revise seus dados', 'Tudo certo antes de ativar o seu perfil?'],
    ];

    const titlesEn = [
      ['What should we call you?', 'Used exclusively for your personal analysis.'],
      ['When were you born?', 'The date provides essential context for your reading.'],
      ['What time?', 'The time refines the accuracy of your analysis.'],
      ['Where were you born?', 'We will only use the location to calculate the timezone.'],
      ['Your preferences', 'You can adjust all of this later in your profile.'],
      ['Review your details', 'Everything set before activating your profile?'],
    ];

    return isEnglish ? titlesEn[step - 1] : titlesPt[step - 1];
  }, [step, isEnglish]);

  const update = (patch: Partial<OrbProfile>) => {
    setDraft((curr) => ({ ...curr, ...patch }));
  };

  const validate = () => {
    if (step === 1 && !draft.fullName.trim()) {
      return isEnglish
        ? 'Please enter your full name to continue.'
        : 'Digite seu nome completo para continuar.';
    }
    if (step === 2) {
      const day = Number(draft.birthDay);
      const month = Number(draft.birthMonth);
      const year = Number(draft.birthYear);
      if (
        !day ||
        !month ||
        !year ||
        day < 1 ||
        day > 31 ||
        month < 1 ||
        month > 12 ||
        year < 1900 ||
        year > currentYear
      ) {
        return isEnglish ? 'Please check your birth date.' : 'Confira a data de nascimento.';
      }
      const date = new Date(year, month - 1, day);
      if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
      ) {
        return isEnglish
          ? 'This date does not appear to be valid.'
          : 'Essa data não parece válida.';
      }
    }
    if (step === 3 && !draft.noExactTime) {
      const hour = Number(draft.birthHour);
      const minute = Number(draft.birthMinute);
      if (
        draft.birthHour.length < 1 ||
        draft.birthMinute.length < 1 ||
        hour > 23 ||
        minute > 59
      ) {
        return isEnglish ? 'Please check your birth time.' : 'Confira o horário de nascimento.';
      }
    }
    if (step === 4) {
      if (!draft.birthCountry.trim()) {
        return isEnglish ? 'Please enter your birth country.' : 'Digite o país de nascimento.';
      }
      if (!draft.birthState.trim()) {
        return isEnglish
          ? 'Please enter your state or region.'
          : 'Digite o estado ou região de nascimento.';
      }
      if (!draft.birthCity.trim()) {
        return isEnglish ? 'Please enter your birth city.' : 'Digite sua cidade de nascimento.';
      }
    }
    return '';
  };

  const next = async () => {
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    setError('');
    if (step < TOTAL_STEPS) {
      setStep((curr) => curr + 1);
    } else {
      setSaving(true);
      await saveProfile(draft);
      await new Promise((r) => setTimeout(r, 400));
      onComplete();
    }
  };

  const previous = () => {
    setError('');
    if (step > 1) {
      setStep((curr) => curr - 1);
    } else {
      onBackToLogin();
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-between px-6 py-6 sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <button
          type="button"
          onClick={previous}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
        >
          <ArrowLeft size={19} />
        </button>
        <ProgressRail step={step} total={TOTAL_STEPS} />
        <OrbBrand compact />
      </div>

      {/* Main Content */}
      <div className="my-auto py-8">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-[var(--text-secondary)]">
          {isEnglish ? `STEP ${String(step).padStart(2, '0')}` : `ETAPA ${String(step).padStart(2, '0')}`}
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight text-[var(--foreground)]">
          {title[0]}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">{title[1]}</p>

        <div className="mt-8 space-y-6">
          {step === 1 && (
            <>
              {/* Google Account Profile Picture Preview */}
              <div className="flex items-center gap-3.5 pb-2">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-2)] shadow-xs">
                  {draft.avatarUrl ? (
                    <img
                      src={draft.avatarUrl}
                      alt={draft.fullName}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-lg font-bold text-[var(--foreground)]">
                      {(draft.fullName || 'O').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--accent)] font-semibold">
                    <CheckCircle2 size={12} />
                    {isEnglish ? 'Google Account Connected' : 'Conta Google Vinculada'}
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] font-mono">
                    {draft.email || 'alinealv.silv@gmail.com'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Full Name' : 'Nome Completo'}
                </label>
                <input
                  type="text"
                  value={draft.fullName}
                  placeholder={isEnglish ? 'Your full name' : 'Nome completo'}
                  onChange={(e) => update({ fullName: e.target.value })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-base text-[var(--foreground)] placeholder-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Username' : 'Nome de Usuário'}
                </label>
                <input
                  type="text"
                  value={draft.preferredName}
                  placeholder={isEnglish ? 'Your username' : 'Seu nome de usuário'}
                  onChange={(e) => update({ preferredName: e.target.value })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-base text-[var(--foreground)] placeholder-[var(--text-tertiary)] outline-none transition-colors focus:border-[var(--accent)]"
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Day' : 'Dia'}
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={draft.birthDay}
                  placeholder="DD"
                  onChange={(e) => update({ birthDay: e.target.value.replace(/\D/g, '') })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-center text-lg font-medium text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Month' : 'Mês'}
                </label>
                <input
                  type="text"
                  maxLength={2}
                  value={draft.birthMonth}
                  placeholder="MM"
                  onChange={(e) => update({ birthMonth: e.target.value.replace(/\D/g, '') })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-center text-lg font-medium text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Year' : 'Ano'}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={draft.birthYear}
                  placeholder="AAAA"
                  onChange={(e) => update({ birthYear: e.target.value.replace(/\D/g, '') })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-center text-lg font-medium text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center justify-center gap-4">
                <div className="w-24">
                  <label className="block text-center text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                    {isEnglish ? 'Hour' : 'Hora'}
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    disabled={draft.noExactTime}
                    value={draft.birthHour}
                    placeholder="HH"
                    onChange={(e) => update({ birthHour: e.target.value.replace(/\D/g, '') })}
                    className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-center text-2xl font-medium text-[var(--foreground)] outline-none focus:border-[var(--accent)] disabled:opacity-30"
                  />
                </div>
                <span className="pt-6 text-2xl text-[var(--text-tertiary)]">:</span>
                <div className="w-24">
                  <label className="block text-center text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                    {isEnglish ? 'Minute' : 'Minuto'}
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    disabled={draft.noExactTime}
                    value={draft.birthMinute}
                    placeholder="MM"
                    onChange={(e) => update({ birthMinute: e.target.value.replace(/\D/g, '') })}
                    className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-center text-2xl font-medium text-[var(--foreground)] outline-none focus:border-[var(--accent)] disabled:opacity-30"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-y border-[var(--border)] py-4">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {isEnglish ? "I don't know my exact time" : 'Não sei minha hora exata'}
                  </p>
                  {draft.noExactTime && (
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {isEnglish
                        ? 'Without exact time, some planetary alignments will be estimated.'
                        : 'Sem o horário, parte da sua análise fica simplificada.'}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={draft.noExactTime}
                  onChange={(e) => update({ noExactTime: e.target.checked })}
                  className="h-5 w-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Country of Birth' : 'País de Nascimento'}
                </label>
                <input
                  type="text"
                  value={draft.birthCountry}
                  placeholder={isEnglish ? 'e.g. Brazil' : 'Ex: Brasil'}
                  onChange={(e) => update({ birthCountry: e.target.value })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'State or Region' : 'Estado ou Região'}
                </label>
                <input
                  type="text"
                  value={draft.birthState}
                  placeholder={isEnglish ? 'e.g. São Paulo' : 'Ex: São Paulo'}
                  onChange={(e) => update({ birthState: e.target.value })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'City of Birth' : 'Cidade de Nascimento'}
                </label>
                <input
                  type="text"
                  value={draft.birthCity}
                  placeholder={isEnglish ? 'e.g. São Paulo' : 'Ex: São Paulo'}
                  onChange={(e) => update({ birthCity: e.target.value })}
                  className="mt-2 block w-full border-b border-[var(--border)] bg-transparent py-2 text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              {draft.birthCity.trim() && draft.birthCountry.trim() && (
                <div className="flex items-center gap-2 rounded bg-[var(--success)]/10 px-3 py-2 text-xs font-medium text-[var(--success)]">
                  <CheckCircle2 size={15} />
                  <span>
                    {isEnglish
                      ? `Detected Timezone: ${draft.timezone}`
                      : `Fuso detectado: ${draft.timezone}`}
                  </span>
                </div>
              )}
            </>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Theme' : 'Tema'}
                </label>
                <div className="mt-2 space-y-2">
                  {[
                    { key: 'light', label: isEnglish ? 'Light' : 'Claro', desc: isEnglish ? 'Crisp light background' : 'Fundo branco e texto profundo' },
                    { key: 'dark', label: isEnglish ? 'Dark' : 'Escuro', desc: isEnglish ? 'Deep black and silver' : 'Preto, prata e contraste baixo' },
                    { key: 'automatic', label: isEnglish ? 'Automatic' : 'Automático', desc: isEnglish ? 'Match device appearance' : 'Segue a aparência do aparelho' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => update({ theme: item.key as OrbTheme })}
                      className={`flex w-full items-center justify-between border-b border-[var(--border)] py-3 text-left transition-colors ${
                        draft.theme === item.key ? 'border-[var(--accent)]' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">{item.label}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{item.desc}</p>
                      </div>
                      {draft.theme === item.key && <Check size={16} className="text-[var(--accent)]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold tracking-widest text-[var(--text-secondary)] uppercase">
                  {isEnglish ? 'Language' : 'Idioma'}
                </label>
                <div className="mt-2 flex gap-4">
                  {[
                    { key: 'pt-BR', label: 'Português' },
                    { key: 'en', label: 'English' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => update({ language: item.key as OrbLanguage })}
                      className={`flex-1 rounded-lg border py-2.5 text-center text-sm font-medium transition-all ${
                        draft.language === item.key
                          ? 'border-[var(--accent)] bg-[var(--surface)] text-[var(--foreground)]'
                          : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {isEnglish ? 'Google Drive & Cloud Backup' : 'Backup no Google Drive'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isEnglish
                      ? 'Automatic cloud sync to your linked account'
                      : 'Sincronização em nuvem na conta vinculada'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.backupGoogleDrive ?? true}
                  onChange={(e) => update({ backupGoogleDrive: e.target.checked })}
                  className="h-5 w-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {isEnglish ? 'Daily Synthesis' : 'Síntese diária'}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {isEnglish
                      ? 'A brief reading to start your day'
                      : 'Uma leitura breve para começar o dia'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={draft.dailySynthesis}
                  onChange={(e) => update({ dailySynthesis: e.target.checked })}
                  className="h-5 w-5 accent-[var(--accent)] rounded cursor-pointer"
                />
              </div>

              {draft.dailySynthesis && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">
                    {isEnglish ? 'Preferred Hour' : 'Horário'}
                  </span>
                  <div className="flex gap-2">
                    {['06:00', '07:00', '08:00', '09:00'].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => update({ synthesisHour: h })}
                        className={`rounded px-2.5 py-1 text-xs font-mono transition-colors ${
                          draft.synthesisHour === h
                            ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                            : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4">
              <ReviewRow
                label={isEnglish ? 'Google Account & Photo' : 'Conta Google & Foto'}
                value={draft.email || 'alinealv.silv@gmail.com'}
                onEdit={() => setStep(1)}
              />
              <ReviewRow
                label={isEnglish ? 'Name' : 'Nome'}
                value={draft.preferredName || draft.fullName}
                onEdit={() => setStep(1)}
              />
              <ReviewRow
                label={isEnglish ? 'Birth Date' : 'Nascimento'}
                value={`${draft.birthDay}/${draft.birthMonth}/${draft.birthYear}`}
                onEdit={() => setStep(2)}
              />
              <ReviewRow
                label={isEnglish ? 'Time' : 'Horário'}
                value={draft.noExactTime ? (isEnglish ? 'Not provided' : 'Não informado') : `${draft.birthHour}:${draft.birthMinute}`}
                onEdit={() => setStep(3)}
              />
              <ReviewRow
                label={isEnglish ? 'Location' : 'Local'}
                value={`${draft.birthCity} · ${draft.birthState} · ${draft.birthCountry}`}
                onEdit={() => setStep(4)}
              />
              <ReviewRow
                label={isEnglish ? 'Backup & Preferences' : 'Backup e Preferências'}
                value={`${draft.theme} · ${draft.language} · Drive ${draft.backupGoogleDrive !== false ? 'Ativo' : 'Inativo'}`}
                onEdit={() => setStep(5)}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 text-xs text-[var(--destructive)]">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={next}
          disabled={saving}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50"
        >
          {saving ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-foreground)] border-t-transparent" />
          ) : (
            <>
              <span>
                {step === TOTAL_STEPS
                  ? isEnglish
                    ? 'Activate My Profile'
                    : 'Ativar meu perfil'
                  : isEnglish
                  ? 'Continue'
                  : 'Continuar'}
              </span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
        <span className="text-sm font-medium text-[var(--foreground)]">{value}</span>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="p-1 text-[var(--text-tertiary)] transition-colors hover:text-[var(--foreground)]"
      >
        <Edit2 size={14} />
      </button>
    </div>
  );
}
