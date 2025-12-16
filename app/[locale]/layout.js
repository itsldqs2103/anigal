import { Manrope } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from 'next-intl';
import Footer from "../../components/Footer";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
});

export const metadata = {
  description: "AniGal - a gallery of stunning anime-style illustrations and artwork.",
};

export default async function RootLayout({ children }) {

  return (
    <html
      lang="en"
      className={`${manrope.className} antialiased bg-base-300 text-base-content`}
    >
      <body>
        <NextIntlClientProvider>
          {children}
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
