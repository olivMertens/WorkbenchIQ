import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { PersonaProvider } from '@/lib/PersonaContext';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GroupaIQ',
  description: 'Poste de travail intelligent de traitement de documents pour l\'assurance',
  icons: {
    icon: '/favicon.svg',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <PersonaProvider>
            {children}
          </PersonaProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
