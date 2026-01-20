'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useUser } from '@/hooks';
import { Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { ProfileForm } from '@/components/profile/profile-form';

export default function ProfilePage() {
  const { user: authUser } = useAuthStore();
  const { data: user, isLoading, isError } = useUser(authUser?.id || '');

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex h-full flex-1 items-center justify-center text-muted-foreground">
        Gagal memuat profil
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profil Saya</h1>
        <p className="text-muted-foreground">
          Kelola informasi profil dan akun Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
          <CardDescription>
            Perbarui nama, email, dan pengaturan keamanan Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialData={user} />
        </CardContent>
      </Card>
    </div>
  );
}
