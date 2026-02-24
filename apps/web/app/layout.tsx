import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { ReactQueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { Toaster } from '@bizflow/ui';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'BizFlow - Enterprise Resource Planning',
  description: 'Sistem ERP untuk bisnis menengah ke bawah',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          <AuthProvider>
            <I18nProvider>
              {children}
              <Toaster richColors />
            </I18nProvider>
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
