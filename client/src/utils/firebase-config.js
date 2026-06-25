import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { env } from '@/config/env';

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_API_KEY,
  authDomain: env.NEXT_PUBLIC_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_APP_ID,
  measurementId: env.NEXT_PUBLIC_MEASUREMENT_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const firebaseAuth = getAuth(app);
