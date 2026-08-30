import React, { useState } from 'react';
import { ArrowUpRight, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { OrbBrand } from './OrbBrand';
import { OrbPreferenceControls } from './OrbPreferenceControls';
import { useOrb } from '../context/OrbContext';
import { OrbProfile } from '../types';
import { googleSignIn } from '../lib/googleAuth';

type Props = {
  onSuccess: (isNewUser?: boolean) => void;
};

export function LoginView({ onSuccess }: Props) {
  const { signIn, saveProfile, profile, preferences } = useOrb();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const isEnglish = preferences.language === 'en';

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    setStatusMessage(
      authMode === 'register'
        ? isEnglish
          ? 'Connecting to Google Account...'
          : 'Conectando à Conta Google...'
        : isEnglish
        ? 'Verifying Google credentials...'
        : 'Verificando credenciais Google...'
    );

    try {
      const authResult = await googleSignIn();

      // If user closed the popup window, quietly finish without throwing
      if (!authResult) {
        setLoading(false);
        setStatusMessage('');
        return;
      }

      if (!authResult.user) {
        throw new Error('Autenticação com Google não concluída.');
      }

      const googleEmail = authResult.email || authResult.user.email || 'alinealv.silv@gmail.com';
      const googleDisplayName = authResult.displayName || authResult.user.displayName || 'Aline Silva';
      const googlePhotoUrl = authResult.photoUrl || authResult.user.photoURL || '';

      const firstName = googleDisplayName.split(' ')[0] || googleDisplayName;

      if (authMode === 'register' || !profile) {
        const newProfile: OrbProfile = {
          fullName: googleDisplayName,
          preferredName: firstName,
          avatarUrl: googlePhotoUrl,
          email: googleEmail,
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
          backupGoogleDrive: true,
          backupEmail: true,
          backupLocal: true,
        };
        await saveProfile(newProfile);
        await signIn(googleEmail);
        onSuccess(true);
      } else {
        // Retain avatarUrl and email
        await saveProfile({
          ...profile,
          avatarUrl: googlePhotoUrl || profile.avatarUrl,
          email: googleEmail || profile.email,
        });
        await signIn(googleEmail);
        onSuccess(false);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError(
          isEnglish
            ? 'Popup was blocked by your browser. Please allow popups.'
            : 'O pop-up de login foi bloqueado pelo navegador. Por favor, permita pop-ups.'
        );
      } else {
        setError(
          err.message ||
            (isEnglish
              ? 'Unable to connect with Google. Please try again.'
              : 'Não foi possível conectar com o Google. Tente novamente.')
        );
      }
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-8 sm:px-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold tracking-[0.2em] text-[var(--text-secondary)]">
          ORB / STAGE
        </span>
        <OrbPreferenceControls compact />
      </div>

      {/* Main Center Area */}
      <div className="my-auto flex flex-col items-center text-center">
        <OrbBrand />
        <p className="mt-4 max-w-[290px] text-[14px] leading-relaxed text-[var(--text-secondary)]">
          {isEnglish
            ? 'Your personal, unique and profound consciousness journal.'
            : 'Sua análise pessoal, única e profunda.'}
        </p>

        {/* Tab switch between Register and Login */}
        <div className="mt-7 flex w-full border-b border-[var(--border)]">
          <button
            type="button"
            onClick={() => setAuthMode('register')}
            className={`flex flex-1 items-center justify-center gap-1.5 pb-2.5 text-xs font-semibold tracking-wider transition-colors ${
              authMode === 'register'
                ? 'border-b-2 border-[var(--accent)] text-[var(--foreground)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <UserPlus size={14} />
            <span>{isEnglish ? 'CREATE ACCOUNT' : 'CRIAR CONTA'}</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('login')}
            className={`flex flex-1 items-center justify-center gap-1.5 pb-2.5 text-xs font-semibold tracking-wider transition-colors ${
              authMode === 'login'
                ? 'border-b-2 border-[var(--accent)] text-[var(--foreground)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            <LogIn size={14} />
            <span>{isEnglish ? 'SIGN IN' : 'ENTRAR'}</span>
          </button>
        </div>

        {/* Google Action Button */}
        <div className="mt-6 w-full space-y-3">
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="group flex h-13 w-full items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4.5 py-3 transition-all hover:border-[var(--accent)] hover:bg-[var(--surface-2)] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="flex w-full items-center justify-center gap-2 text-sm text-[var(--text-primary)]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
                <span className="text-xs font-mono">
                  {statusMessage || (isEnglish ? 'Connecting...' : 'Conectando...')}
                </span>
              </div>
            ) : (
              <>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)]">
                  <span className="font-bold text-xs text-[var(--accent)]">G</span>
                </div>
                <span className="font-medium text-[14px] text-[var(--foreground)]">
                  {authMode === 'register'
                    ? isEnglish
                      ? 'Register with Google'
                      : 'Cadastrar com Google'
                    : isEnglish
                    ? 'Continue with Google'
                    : 'Entrar com Google'}
                </span>
                <ArrowUpRight
                  size={17}
                  className="text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--foreground)]"
                />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex w-full items-center gap-2 rounded border-l-2 border-[var(--destructive)] bg-[var(--destructive)]/5 px-3 py-2 text-left text-xs text-[var(--destructive)]">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Footer Terms */}
      <p className="text-center text-xs leading-relaxed text-[var(--text-tertiary)]">
        {isEnglish
          ? 'By continuing, you agree to our Terms of Use and Privacy Policy.'
          : 'Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade.'}
      </p>
    </div>
  );
}
