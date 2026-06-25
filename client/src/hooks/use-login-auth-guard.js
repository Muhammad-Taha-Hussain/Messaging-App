import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { onAuthStateChanged } from 'firebase/auth';
import { useQueryClient } from '@tanstack/react-query';
import { checkUser } from '@/api/auth.api';
import { queryKeys } from '@/api/query-keys';
import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { firebaseAuth } from '@/utils/firebase-config';
import { clearAuthSessionCookie, setAuthSessionCookie } from '@/lib/auth-session';

export function useLoginAuthGuard() {
  const router = useRouter();
  const [, dispatch] = useStateProvider();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (currentUser) => {
      if (!currentUser?.email) {
        clearAuthSessionCookie();
        dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
        dispatch({ type: reducerCases.SET_USER_INFO, userInfo: undefined });
        setReady(true);
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
          router.replace('/');
        }
      } catch {
        setReady(true);
      }
    });

    return unsubscribe;
  }, [dispatch, queryClient, router]);

  return ready;
}
