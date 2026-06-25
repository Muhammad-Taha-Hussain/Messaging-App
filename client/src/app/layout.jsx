import '@/styles/globals.css';
import '@/config/env';
import { QueryProvider } from '@/providers/query-provider';

export const metadata = {
  title: 'Whatsapp',
  icons: {
    shortcut: '/favicon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
