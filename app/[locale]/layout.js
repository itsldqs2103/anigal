import '@/app/globals.css';

import { Manrope } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';

import Footer from '@/components/Footer';
import LayoutScript from '@/components/LayoutScript';
import Navigation from '@/components/Navigation';

const manrope = Manrope({
  subsets: ['latin', 'vietnamese'],
});

export const metadata = {
  description:
    'AniGal - a gallery of stunning anime-style illustrations and artwork.',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      translate="no"
      className={`${manrope.className} bg-base-300 text-base-content antialiased`}
    >
      <body suppressHydrationWarning>
        <LayoutScript />
        <NextIntlClientProvider>
          <Navigation />
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
