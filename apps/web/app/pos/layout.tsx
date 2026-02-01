'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !accessToken) {
      router.push('/auth/login');
    }
  }, [accessToken, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!accessToken) return null;

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
}
