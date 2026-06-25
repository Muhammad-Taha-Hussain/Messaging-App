'use client';

import { HydrationBoundary } from '@tanstack/react-query';
import { StateProvider } from '@/context/state-context';
import reducer, { initialState } from '@/context/state-reducers';
import MainClient from '@/components/main-client';

export default function HomePageClient({ dehydratedState, initialUserInfo }) {
  const stateOverrides = initialUserInfo
    ? { userInfo: initialUserInfo, newUser: false }
    : undefined;

  return (
    <HydrationBoundary state={dehydratedState}>
      <StateProvider
        initialState={initialState}
        reducer={reducer}
        stateOverrides={stateOverrides}
      >
        <MainClient initialUserInfo={initialUserInfo} />
      </StateProvider>
    </HydrationBoundary>
  );
}
