'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@bizflow/ui';
import {
  updateUserSchema,
  changePasswordSchema,
  type UpdateUserValues,
  type ChangePasswordValues,
  type User,
} from '@bizflow/types';
import { usersService } from '@/services/users.service';
import { authService } from '@/services/auth.service';

interface ProfileFormProps {
  initialData: User;
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');

  const form = useForm<UpdateUserValues>({
    // @ts-ignore - reuse preprocess schema logic
    resolver: zodResolver(updateUserSchema) as any,
    defaultValues: {
      name: initialData.name,
      email: initialData.email || '',
      // Role & Status are handled by admin, not here
    },
  });

  const passwordForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const { isSubmitting } = form.formState;
  const { isSubmitting: isChangingPassword } = passwordForm.formState;

  const onSubmit = async (data: UpdateUserValues) => {
    try {
      // Filter out sensitive fields just in case script injection
      // Although schema validation handles it, we strictly send only allowed fields for profile
      await usersService.update(initialData.id, {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      });
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal memperbarui profil',
      );
    }
  };

  const onChangePassword = async (data: ChangePasswordValues) => {
    try {
      await authService.changePassword(data);
      toast.success('Password berhasil diubah');
      setShowPasswordDialog(false);
      passwordForm.reset();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengubah password',
      );
    }
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin) return;

    if (!/^\d{6}$/.test(newPin)) {
      toast.error('PIN harus terdiri dari 6 digit angka');
      return;
    }

    try {
      setIsChangingPin(true);
      // For self-service PIN change, we might need current PIN verification in backend
      // But currrent endpoint allows admin override.
      // If endpoint requires current PIN, we need input for it.
      // Checking schemas/user.ts -> changePinSchema has currentPin optional.
      // Checking users.service.ts -> changePin verifies currentPin IF VALID.

      await usersService.changePin(initialData.id, {
        currentPin: currentPin || undefined,
        newPin,
      });
      toast.success('PIN berhasil diubah');
      setShowPinDialog(false);
      setNewPin('');
      setCurrentPin('');
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengubah PIN',
      );
    } finally {
      setIsChangingPin(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nama Lengkap"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={initialData.username} disabled />
              <p className="text-sm text-muted-foreground">
                Username tidak dapat diubah.
              </p>
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Role</Label>
              <Input
                value={initialData.role?.name || '-'}
                disabled
                className="capitalize"
              />
              <p className="text-sm text-muted-foreground">
                Hubungi admin untuk mengubah role.
              </p>
            </div>
          </div>

          <div className="flex justify-start">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Simpan Profil
            </Button>
          </div>
        </form>
      </Form>

      <Separator />

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Keamanan</h3>
          <p className="text-sm text-muted-foreground">
            Kelola password dan PIN untuk login.
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPasswordDialog(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            Ganti Password
          </Button>

          <Button
            variant="outline"
            type="button"
            onClick={() => setShowPinDialog(true)}
          >
            <Lock className="mr-2 h-4 w-4" />
            Ganti PIN
          </Button>
        </div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Masukkan password saat ini dan password baru Anda.
            </DialogDescription>
          </DialogHeader>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onChangePassword)}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Lama</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Baru</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimal 8 karakter, 1 huruf besar, dan 1 angka.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordDialog(false)}
                  disabled={isChangingPassword}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan Password
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Change PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <form onSubmit={handleChangePin}>
            <DialogHeader>
              <DialogTitle>Ganti PIN</DialogTitle>
              <DialogDescription>
                Masukkan PIN saat ini (jika ada) dan PIN baru Anda.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentPin" className="text-right">
                  PIN Lama
                </Label>
                <Input
                  id="currentPin"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="col-span-3"
                  value={currentPin}
                  onChange={(e) =>
                    setCurrentPin(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="Kosongkan jika belum punya PIN"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="newPin" className="text-right">
                  PIN Baru
                </Label>
                <Input
                  id="newPin"
                  type="password" // Use password type for PIN
                  inputMode="numeric"
                  maxLength={6}
                  className="col-span-3"
                  value={newPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setNewPin(val);
                  }}
                  placeholder="6 digit angka"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPinDialog(false)}
                disabled={isChangingPin}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isChangingPin || newPin.length !== 6}
              >
                {isChangingPin ? 'Menyimpan...' : 'Simpan PIN'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
