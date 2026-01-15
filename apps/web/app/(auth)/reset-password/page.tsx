'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, AlertCircle } from 'lucide-react';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { authService } from '@/services/auth.service';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@bizflow/ui';
import { useQuery } from '@tanstack/react-query';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  // Verify token on mount
  const { isPending, error, data } = useQuery({
    queryKey: ['verifyResetToken', token],
    queryFn: () => authService.verifyResetToken(token!),
    enabled: !!token,
    retry: false,
  });

  if (!token) {
    return (
      <Card className="w-full max-w-sm border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Link Tidak Valid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Token reset password tidak ditemukan. Pastikan Anda menggunakan link
            lengkap dari email.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">Kembali ke Login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (isPending) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[200px]">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-sm text-muted-foreground">
            Memverifikasi token...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-sm border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Link Kadaluarsa atau Tidak Valid
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Link reset password ini sudah tidak berlaku atau sudah digunakan.
            Silakan request reset password baru.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/forgot-password" className="w-full">
            <Button className="w-full">Request Reset Baru</Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">
              Kembali ke Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      {data?.user && (
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">Reset password untuk:</p>
          <p className="font-medium">
            {data.user.name} ({data.user.username})
          </p>
        </div>
      )}
      <ResetPasswordForm token={token} />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
