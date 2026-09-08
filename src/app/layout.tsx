import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Credex AI Spend Audit",
    template: "%s | Credex AI Spend Audit",
  },
  description:
    "Audit ChatGPT, Claude, Cursor, Copilot, Gemini, OpenAI API, Anthropic API, and Windsurf spend in minutes.",
  openGraph: {
    title: "Credex AI Spend Audit",
    description: "Find waste in your AI software stack and turn it into monthly savings.",
    url: "/",
    siteName: "Credex AI Spend Audit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Credex AI Spend Audit",
    description: "A startup-grade audit for AI tool spend.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to avoid theme flash on load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('credex.theme')||'dark';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);document.documentElement.setAttribute('data-theme',t);})();`,
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteHeader />
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
