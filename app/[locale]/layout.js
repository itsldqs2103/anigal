import { Manrope } from "next/font/google";
import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import Footer from "@/components/Footer";
import LayoutScript from "@/components/LayoutScript";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  description: "AniGal - a gallery of stunning anime-style illustrations and artwork.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.className} antialiased bg-base-300 text-base-content`}
    >
      <body>
        <LayoutScript />
        <NextIntlClientProvider>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
