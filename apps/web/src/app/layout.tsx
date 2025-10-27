import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { env } from '@/lib/env';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: env.NEXT_PUBLIC_APP_NAME,
  description: 'Lightweight, LLM-friendly Next.js starter',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
