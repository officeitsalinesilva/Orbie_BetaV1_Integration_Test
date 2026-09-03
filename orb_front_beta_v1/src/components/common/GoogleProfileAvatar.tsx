import React, { useState, useEffect } from 'react';
import { OrbProfile } from '../../types';
import { User } from 'lucide-react';
import { auth } from '../../lib/googleAuth';

type Props = {
  profile?: OrbProfile | null;
  avatarUrl?: string | null;
  name?: string;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  title?: string;
};

export function GoogleProfileAvatar({
  profile,
  avatarUrl: explicitAvatarUrl,
  name,
  onClick,
  size = 'sm',
  className = '',
  title = 'Conta Google / Menu',
}: Props) {
  const [imageError, setImageError] = useState(false);

  // Resolution hierarchy: explicit prop -> profile avatar -> Firebase auth currentUser photoURL
  const avatarUrl = explicitAvatarUrl || profile?.avatarUrl || auth.currentUser?.photoURL || null;

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const displayName =
    name ||
    profile?.preferredName ||
    profile?.fullName?.split(' ')[0] ||
    auth.currentUser?.displayName?.split(' ')[0] ||
    '';

  const avatarLetter = (displayName || 'U').slice(0, 1).toUpperCase();

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-xl',
  };

  const imageSizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const hasValidPhoto = Boolean(avatarUrl && !imageError);

  return (
    <button
      type="button"
      id="btn-navbar-google-profile-avatar"
      onClick={onClick}
      aria-label={title}
      title={title}
      className={`relative inline-flex items-center justify-center rounded-full overflow-hidden transition-all duration-150 hover:opacity-90 active:scale-95 cursor-pointer ring-1 ring-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] ${sizeClasses[size]} ${className}`}
    >
      {hasValidPhoto ? (
        <img
          src={avatarUrl!}
          alt={displayName}
          onError={() => setImageError(true)}
          referrerPolicy="no-referrer"
          className={`${imageSizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-[var(--accent)] font-semibold text-[var(--accent-foreground)]`}>
          {avatarLetter ? <span>{avatarLetter}</span> : <User size={size === 'lg' ? 24 : 14} />}
        </div>
      )}
    </button>
  );
}
