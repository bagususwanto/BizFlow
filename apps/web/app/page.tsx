'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@bizflow/ui';
import { useLogoutMutation } from '@/hooks/use-auth-mutations';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { mutate: logout, isPending } = useLogoutMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
      <p className="text-muted-foreground">Logged in as {user?.email}</p>
      <Button
        onClick={() => logout()}
        variant="destructive"
        disabled={isPending}
      >
        {isPending ? 'Logging out...' : 'Logout'}
      </Button>
    </div>
  );
}
