import '@/styles/globals.css';
import '@/config/env'; // Load environment variables
import { StateProvider } from '@/context/state-context';
import { QueryProvider } from '@/providers/query-provider';
import Head from 'next/head';
import reducer, { initialState } from '@/context/state-reducers';

export default function App({ Component, pageProps }) {
  return (
    <QueryProvider>
      <StateProvider initialState={initialState} reducer={reducer}>
        <Head>
          <title>Whatsapp</title>
          <link rel="shortcut icon" href="/favicon.png" />
        </Head>
        <Component {...pageProps} />
      </StateProvider>
    </QueryProvider>
  );
}
