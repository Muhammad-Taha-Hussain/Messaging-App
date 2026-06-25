import { signOut } from 'firebase/auth';
import { firebaseAuth } from '@/utils/firebase-config';
import { clearAuthSessionCookie } from '@/lib/auth-session';
import { clearPersistedAuthState } from '@/lib/persisted-auth-state';

export async function signOutUser() {
  clearAuthSessionCookie();
  clearPersistedAuthState();
  await signOut(firebaseAuth);
}
