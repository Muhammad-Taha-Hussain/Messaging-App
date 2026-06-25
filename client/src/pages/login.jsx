import { reducerCases } from '@/context/constants';
import { useStateProvider } from '@/context/state-context';
import { useCheckUser } from '@/hooks/use-auth-api';
import { useLoginAuthGuard } from '@/hooks/use-login-auth-guard';
import { setAuthSessionCookie } from '@/lib/auth-session';
import { firebaseAuth } from '@/utils/firebase-config';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import { FcGoogle } from 'react-icons/fc';

function Login() {
  const router = useRouter();

  const [, dispatch] = useStateProvider();
  const { mutateAsync: checkUserAccount } = useCheckUser();
  const ready = useLoginAuthGuard();
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  const handleLogin = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    const provider = new GoogleAuthProvider();
    let user;
    try {
      const result = await signInWithPopup(firebaseAuth, provider);
      user = result.user;
    } catch (error) {
      const code = error?.code;
      if (
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/user-cancelled'
      ) {
        setIsSigningIn(false);
        return;
      }
      console.error('Firebase sign-in failed:', error);
      setIsSigningIn(false);
      return;
    }

    const {
      displayName: name,
      email,
      photoURL: profileImage,
    } = user ?? {};

    try {
      if (email) {
        const data = await checkUserAccount(email);
        if (!data.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              profileImage,
              status: '',
            },
          });
          router.replace('/onboarding');
        } else {
          const {
            id,
            name: existingName,
            email: existingEmail,
            profilePicture: existingProfileImage,
            status,
          } = data.data;

          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id,
              name: existingName,
              email: existingEmail,
              profileImage: existingProfileImage,
              status,
            },
          });
          setAuthSessionCookie({
            id,
            name: existingName,
            email: existingEmail,
            profileImage: existingProfileImage,
            status,
          });
          window.location.assign('/');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsSigningIn(false);
    }
  };
  if (!ready) {
    return null;
  }

  return (
    <div className="flex items-center justify-center text-white font-bold bg-panel-header-background h-screen w-screen flex-col">
      <div className="flex items-center justify-center gap-28 text-white">
        <Image src={'/whatsapp.gif'} alt="whatsapp" width={300} height={300} />
        <div className="flex-col items-center justify-between">
          <p className="text-6xl mb-6 self-center">WhatsApp</p>

          <button
            className="flex bg-search-input-container-background p-4 rounded-lg"
            onClick={handleLogin}
            disabled={isSigningIn}
          >
            <FcGoogle className={'text-3xl'} />

            <span className="text-white text-1xl">
              {isSigningIn ? 'Signing in…' : 'Login with Google'}
            </span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default Login;
