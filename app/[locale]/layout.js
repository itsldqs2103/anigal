import '@/app/globals.css';

import { Manrope } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';

import Footer from '@/components/Footer';
import LayoutScript from '@/components/LayoutScript';
import TopNav from '@/components/TopNav';

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
      className={`${manrope.className} bg-base-300 text-base-content font-sans antialiased`}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider>
          <TopNav />
          {children}
          <Footer />
        </NextIntlClientProvider>
        <LayoutScript />
      </body>
    </html>
  );
}
