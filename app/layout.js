import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
});

export const metadata = {
  description: "AniGal - a gallery of stunning anime-style illustrations and artwork.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${manrope.className} antialiased bg-base-300 text-base-content`}>
      <body>
        {children}
      </body>
    </html>
  );
}
