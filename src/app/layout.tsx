import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Topbar } from '@/components/layout/Topbar';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DefendFi — DeFi Risk Intelligence',
  description: 'Monitor, analyze, and protect your DeFi portfolio with real-time risk intelligence.',
  keywords: ['DeFi', 'risk', 'portfolio', 'Web3', 'blockchain', 'security'],
  openGraph: {
    title: 'DefendFi — DeFi Risk Intelligence',
    description: 'Monitor, analyze, and protect your DeFi portfolio with real-time risk intelligence.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        suppressHydrationWarning: the anti-flash script modifies className
        before React hydrates, which would cause a mismatch without this flag.
      */}
      <head>
        {/* ── Anti-flash / FOUC prevention ──────────────────────────
            This script runs synchronously (blocking) before any paint.
            It reads localStorage and applies the `dark` class immediately,
            preventing any flash of the wrong theme on page load/reload.
        ─────────────────────────────────────────────────────────── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){if(t==='dark')document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}else if(window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.classList.add('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Providers>
            <Topbar />
            <main className="pt-[68px] min-h-screen">
              {children}
            </main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
