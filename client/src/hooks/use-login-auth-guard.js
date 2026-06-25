import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { checkUser } from '@/api/auth.api';
import { queryKeys } from '@/api/query-keys';
import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { firebaseAuth } from '@/utils/firebase-config';
import { clearAuthSessionCookie, setAuthSessionCookie } from '@/lib/auth-session';
import { waitForFirebaseAuth } from '@/lib/wait-for-firebase-auth';

export function useLoginAuthGuard() {
  const router = useRouter();
  const [, dispatch] = useStateProvider();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe = () => {};

    const handleAuthenticatedUser = async (currentUser) => {
      if (!currentUser?.email || isRedirectingRef.current || cancelled) {
        return;
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: queryKeys.auth.checkUser(currentUser.email),
          queryFn: () => checkUser(currentUser.email),
          staleTime: 5 * 60 * 1000,
        });

        if (!data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name: currentUser.displayName ?? '',
              email: currentUser.email,
              profileImage: currentUser.photoURL ?? '/default_avatar.png',
              status: '',
            },
          });
          isRedirectingRef.current = true;
          router.replace('/onboarding');
          return;
        }

        if (data.data) {
          const {
            id,
            name,
            email,
            profilePicture: profileImage,
            status,
          } = data.data;
          const verifiedUser = { id, name, email, profileImage, status };

          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: verifiedUser,
          });
          setAuthSessionCookie(verifiedUser);
          isRedirectingRef.current = true;
          window.location.assign('/');
        }
      } catch {
        if (!cancelled) {
          setReady(true);
        }
      }
    };

    const setupAuthListener = async () => {
      const currentUser = await waitForFirebaseAuth(firebaseAuth);
      if (cancelled) return;

      if (!currentUser?.email) {
        clearAuthSessionCookie();
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
        dispatch({ type: reducerCases.SET_USER_INFO, userInfo: undefined });
        setReady(true);
        return;
      }

      await handleAuthenticatedUser(currentUser);

      unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        if (!user?.email) {
          clearAuthSessionCookie();
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
          dispatch({ type: reducerCases.SET_USER_INFO, userInfo: undefined });
          setReady(true);
          return;
        }

        handleAuthenticatedUser(user);
      });
    };

    setupAuthListener();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [dispatch, queryClient, router]);

  return ready;
}
