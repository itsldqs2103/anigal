import { Manrope } from "next/font/google";
import "./globals.css";
import axios from "axios";
import moment from "moment";

const manrope = Manrope({
  subsets: ["latin"],
});

export const metadata = {
  description: "AniGal - a gallery of stunning anime-style illustrations and artwork.",
};

export default async function RootLayout({ children }) {
  let commitId = "";
  let commitUrl = "";
  let updatedAgo = "";

  try {
    const response = await axios.get(
      "https://api.github.com/repos/itsldqs2103/anigal/commits"
    );
    const latestCommit = response.data[0];
    if (latestCommit) {
      commitId = latestCommit.sha.substring(0, 7);
      commitUrl = latestCommit.html_url;
      updatedAgo = moment(latestCommit.commit.author.date).fromNow();
    }
  } catch (error) {
    console.error("Error fetching latest commit:", error);
  }

  return (
    <html
      lang="en"
      className={`${manrope.className} antialiased bg-base-300 text-base-content`}
    >
      <body>
        {children}

        <footer className="text-end p-4">
          Version:{" "}
          <a
            href={commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-[color]"
          >
            {commitId || "unknown"}
          </a>{" "}
          {updatedAgo && `(Updated ${updatedAgo})`}
        </footer>
      </body>
    </html>
  );
}
