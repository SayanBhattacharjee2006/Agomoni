import type { Metadata } from "next";
import { Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-noto-serif-bengali",
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "আগমনী — Agomoni | Bengali Durga Puja Radio",
  description:
    "আগমনী — Enter a Bengali Bonedi Bari during Durga Puja. Immerse yourself in Agomoni songs, devotional music, and the atmosphere of Sharad season.",
  keywords: [
    "Agomoni",
    "আগমনী",
    "Durga Puja",
    "Bengali Music",
    "Agomoni Songs",
    "Bengali Radio",
    "Bonedi Bari",
    "Durga Puja Radio",
    "Puja Songs",
    "Sharad",
  ],
  openGraph: {
    title: "আগমনী — Agomoni",
    description:
      "An immersive Bengali Durga Puja radio experience. Agomoni songs playing in a Bonedi Bari during Sharad.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${notoSerifBengali.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#0a0806] text-[#FFF8E7] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
