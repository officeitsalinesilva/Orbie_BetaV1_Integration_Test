import React from 'react';
import { NotificationsModal } from './NotificationsModal';
import { useOrb } from '../context/OrbContext';

type Props = {
  onBack: () => void;
  onNavigateToData: () => void;
  onOpenWallet?: () => void;
  onOpenCatalog?: () => void;
};

export function NotificationsView({ onBack, onNavigateToData, onOpenWallet, onOpenCatalog }: Props) {
  const { preferences } = useOrb();
  const isEnglish = preferences.language === 'en';

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <NotificationsModal
        isOpen={true}
        onClose={onBack}
        onNavigateToData={onNavigateToData}
        onOpenWallet={onOpenWallet}
        onOpenCatalog={onOpenCatalog}
        isEnglish={isEnglish}
      />
    </div>
  );
}
