import '@/app/globals.css';

import { Roboto, Roboto_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';

import Footer from '@/components/Footer';
import LayoutScript from '@/components/LayoutScript';
import Navigation from '@/components/Navigation';

const robotoSans = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
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
      className={`${robotoSans.variable} ${robotoMono.variable} font-sans bg-base-300 text-base-content antialiased`}
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
