import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Standard unrestricted Google identity scopes - available to ANY Google user without test-mode verification
const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
provider.addScope('openid');
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  photoUrl: string | null;
  email: string | null;
  displayName: string | null;
  uid: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);

    return {
      user: result.user,
      uid: result.user.uid,
      photoUrl: result.user.photoURL || null,
      email: result.user.email || null,
      displayName: result.user.displayName || null,
    };
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      // User dismissed or closed the popup window - not an application failure
      return null;
    }
    console.warn('Google Sign In:', error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const logoutGoogle = async () => {
  await signOut(auth);
};
