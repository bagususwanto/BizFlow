import type { Metadata } from 'next';
import localFont from 'next/font/local';
import '@bizflow/ui/styles.css';
import { ReactQueryProvider } from '@/providers/query-provider';
import { AuthProvider } from '@/providers/auth-provider';
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
            {children}
            <Toaster />
          </AuthProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
