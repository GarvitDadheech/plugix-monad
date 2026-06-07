import type { ReactNode } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "Plugix — API Marketplace for AI Agents",
  description:
    "AI agents discover APIs, pay automatically in USDC, and settle on Monad. Developers earn per execution.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${inter.variable} ${jakarta.variable} ${GeistMono.variable}`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
