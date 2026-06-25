import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { signOutUser } from '@/lib/sign-out';

function Logout() {
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const runLogout = async () => {
      await signOutUser();
      if (active) {
        router.replace('/login');
      }
    };

    runLogout();

    return () => {
      active = false;
    };
  }, [router]);

  return null;
}

export default Logout;
