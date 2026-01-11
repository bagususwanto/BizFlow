import type { Metadata } from 'next';
import { AuthLayoutClient } from './layout-client';

export const metadata: Metadata = {
  title: 'Login - BizFlow',
  description: 'Login ke sistem BizFlow ERP',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthLayoutClient>{children}</AuthLayoutClient>;
}
