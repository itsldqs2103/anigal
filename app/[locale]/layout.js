import { Manrope } from 'next/font/google';
import '@/app/globals.css';
import { NextIntlClientProvider } from 'next-intl';
import Footer from '@/components/Footer';
import LayoutScript from '@/components/LayoutScript';

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
      lang="en" translate="no"
      className={`${manrope.className} antialiased bg-base-300 text-base-content`}
    >
      <body suppressHydrationWarning>
        <LayoutScript />
        <NextIntlClientProvider>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
