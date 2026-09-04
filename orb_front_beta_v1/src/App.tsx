import React, { useState, useEffect } from 'react';
import { useOrb, OrbProvider } from './context/OrbContext';
import { NeuroAudioProvider, useNeuroAudio } from './context/NeuroAudioContext';
import { LoginView } from './components/LoginView';
import { OnboardingView } from './components/OnboardingView';
import { DailyJournalView } from './components/DailyJournalView';
import { ProfileView } from './components/ProfileView';
import { WalletView } from './components/WalletView';
import { NotificationsModal } from './components/NotificationsModal';
import { NeuroacusticaView } from './components/neuroacustica/NeuroacusticaView';
import { CatalogView } from './components/catalog/CatalogView';
import { ChatView } from './components/chat/ChatView';
import { FloatingAudioBar } from './components/neuroacustica/FloatingAudioBar';
import { AdminCouponCenterModal } from './components/admin/AdminCouponCenterModal';

type Screen =
  | 'login'
  | 'onboarding'
  | 'daily-journal'
  | 'profile'
  | 'wallet'
  | 'notifications'
  | 'neuroacustica'
  | 'catalog'
  | 'chat';

function MainApp() {
  const { profile, preferences, hydrated, isSignedIn, signOut } = useOrb();
  const { stopAll } = useNeuroAudio();
  const [currentScreen, setCurrentScreen] = useState<Screen>('daily-journal');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminCouponCenterOpen, setIsAdminCouponCenterOpen] = useState(false);
  const isEnglish = preferences.language === 'en';

  useEffect(() => {
    if (!hydrated) return;

    if (!isSignedIn) {
      setCurrentScreen('login');
    } else if (!profile) {
      setCurrentScreen('onboarding');
    } else if (currentScreen === 'login') {
      setCurrentScreen('daily-journal');
    }
  }, [hydrated, isSignedIn, profile]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
      </div>
    );
  }

  const handleSignOut = async () => {
    stopAll();
    await signOut();
    setCurrentScreen('login');
  };

  const activeScreenForRender = currentScreen === 'notifications' ? 'daily-journal' : currentScreen;
  const isModalOpen = isNotificationsOpen || currentScreen === 'notifications';

  return (
    <>
      {(() => {
        switch (activeScreenForRender) {
          case 'login':
            return (
              <LoginView
                onSuccess={(isNewUser) => {
                  if (isNewUser) {
                    setCurrentScreen('onboarding');
                  } else {
                    setCurrentScreen('daily-journal');
                  }
                }}
              />
            );

          case 'onboarding':
            return (
              <OnboardingView
                onComplete={() => setCurrentScreen('daily-journal')}
                onBackToLogin={() => setCurrentScreen('login')}
              />
            );

          case 'profile':
            return (
              <ProfileView
                onBack={() => setCurrentScreen('daily-journal')}
                onOpenWallet={() => setCurrentScreen('wallet')}
                onOpenCatalog={() => setCurrentScreen('catalog')}
                onOpenDailyJournal={() => setCurrentScreen('daily-journal')}
                onOpenNeuroacustica={() => setCurrentScreen('neuroacustica')}
                onOpenChat={() => setCurrentScreen('chat')}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onSignOut={handleSignOut}
                isEnglish={isEnglish}
              />
            );

          case 'wallet':
            return (
              <WalletView
                onBack={() => setCurrentScreen('daily-journal')}
                onOpenProfile={() => setCurrentScreen('profile')}
                onOpenCatalog={() => setCurrentScreen('catalog')}
                onOpenDailyJournal={() => setCurrentScreen('daily-journal')}
                onOpenNeuroacustica={() => setCurrentScreen('neuroacustica')}
                onOpenChat={() => setCurrentScreen('chat')}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenAdminCouponCenter={() => setIsAdminCouponCenterOpen(true)}
                onSignOut={handleSignOut}
              />
            );

          case 'neuroacustica':
            return (
              <NeuroacusticaView
                onBack={() => setCurrentScreen('daily-journal')}
                onOpenProfile={() => setCurrentScreen('profile')}
                onOpenWallet={() => setCurrentScreen('wallet')}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenDailyJournal={() => setCurrentScreen('daily-journal')}
                onOpenCatalog={() => setCurrentScreen('catalog')}
                onOpenChat={() => setCurrentScreen('chat')}
                onSignOut={handleSignOut}
                isEnglish={isEnglish}
              />
            );

          case 'catalog':
            return (
              <CatalogView
                onOpenProfile={() => setCurrentScreen('profile')}
                onOpenWallet={() => setCurrentScreen('wallet')}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenDailyJournal={() => setCurrentScreen('daily-journal')}
                onOpenNeuroacustica={() => setCurrentScreen('neuroacustica')}
                onOpenChat={() => setCurrentScreen('chat')}
                onSignOut={handleSignOut}
                isEnglish={isEnglish}
              />
            );

          case 'chat':
            return (
              <ChatView
                onBack={() => setCurrentScreen('daily-journal')}
                onOpenProfile={() => setCurrentScreen('profile')}
                onOpenWallet={() => setCurrentScreen('wallet')}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenDailyJournal={() => setCurrentScreen('daily-journal')}
                onOpenNeuroacustica={() => setCurrentScreen('neuroacustica')}
                onOpenCatalog={() => setCurrentScreen('catalog')}
                onSignOut={handleSignOut}
                isEnglish={isEnglish}
              />
            );

          case 'daily-journal':
          default:
            return (
              <DailyJournalView
                onOpenProfile={() => setCurrentScreen('profile')}
                onOpenWallet={() => setCurrentScreen('wallet')}
                onOpenNotifications={() => setIsNotificationsOpen(true)}
                onOpenNeuroacustica={() => setCurrentScreen('neuroacustica')}
                onOpenCatalog={() => setCurrentScreen('catalog')}
                onOpenChat={() => setCurrentScreen('chat')}
                onOpenAdminCouponCenter={() => setIsAdminCouponCenterOpen(true)}
                onSignOut={handleSignOut}
              />
            );
        }
      })()}

      {/* Notifications Modal (rendered directly on top of the active workspace with background visible) */}
      <NotificationsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsNotificationsOpen(false);
          if (currentScreen === 'notifications') {
            setCurrentScreen('daily-journal');
          }
        }}
        onNavigateToData={() => {
          setIsNotificationsOpen(false);
          setCurrentScreen('daily-journal');
        }}
        onOpenWallet={() => {
          setIsNotificationsOpen(false);
          setCurrentScreen('wallet');
        }}
        onOpenCatalog={() => {
          setIsNotificationsOpen(false);
          setCurrentScreen('catalog');
        }}
        isEnglish={isEnglish}
      />

      {/* Central Admin Modal for Coupons, Campaigns, QR and Notifications (Admin Web) */}
      <AdminCouponCenterModal
        isOpen={isAdminCouponCenterOpen}
        onClose={() => setIsAdminCouponCenterOpen(false)}
      />

      {/* Apple-Style Floating Mini Player Dock (Persistent background audio control across all screens except inside the studio itself) */}
      {activeScreenForRender !== 'neuroacustica' && (
        <FloatingAudioBar
          onOpenStudio={() => setCurrentScreen('neuroacustica')}
          isEnglish={isEnglish}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <OrbProvider>
      <NeuroAudioProvider>
        <MainApp />
      </NeuroAudioProvider>
    </OrbProvider>
  );
}

