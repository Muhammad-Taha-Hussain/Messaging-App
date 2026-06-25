import { redirect } from 'next/navigation';
import { prefetchHomeData } from '@/lib/prefetch-home-data';
import HomePageClient from '@/components/home-page-client';

export default async function HomePage() {
  const { dehydratedState, userInfo } = await prefetchHomeData();

  if (!userInfo?.id) {
    redirect('/login');
  }

  return <HomePageClient dehydratedState={dehydratedState} initialUserInfo={userInfo} />;
}
