'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  AlertDescription,
  AlertTitle,
} from '@bizflow/ui';

import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@bizflow/types/schemas';
import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';

export function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );
  const [resetToken, setResetToken] = React.useState<string | null>(null);

  const { mutate: requestReset, isPending } = useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
    onSuccess: (data) => {
      setSuccessMessage(data.message);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
    },
    onError: (error: any) => {
      // Security: Even if error, likely we shouldn't reveal too much,
      // but if the API returns error 500 etc we show generic error.
      // For strictly non-existent email, API returns success anyway.
      console.error(error);
    },
  });

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: ForgotPasswordValues) {
    requestReset(values.email);
  }

  if (successMessage) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <div className="flex items-center justify-center w-full mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Cek Email Anda</CardTitle>
          <CardDescription className="text-center">
            {successMessage}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetToken && (
            <Alert className="mb-4 bg-yellow-50 border-yellow-200">
              <AlertTitle className="text-yellow-800">
                Mode Development / On-Premise
              </AlertTitle>
              <AlertDescription className="text-yellow-700 text-xs break-all">
                Token: {resetToken}
                <br />
                <Link
                  href={`/reset-password?token=${resetToken}`}
                  className="underline font-bold mt-2 block"
                >
                  Klik disini untuk reset password
                </Link>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login">
            <Button variant="outline">Kembali ke Login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Lupa Password</CardTitle>
        <CardDescription>
          Masukkan email yang terdaftar untuk menerima instruksi reset password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nama@perusahaan.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kirim Instruksi
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Link
          href="/login"
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Login
        </Link>
      </CardFooter>
    </Card>
  );
}
