'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function PosLayout({ children }: { children: React.ReactNode }) {
  const { accessToken, isLoading } = useAuthStore();
  const router = useRouter();

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isLoading && !accessToken) {
      router.push('/auth/login');
    }
  }, [hydrated, accessToken, isLoading, router]);

  if (!hydrated || isLoading) {
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
