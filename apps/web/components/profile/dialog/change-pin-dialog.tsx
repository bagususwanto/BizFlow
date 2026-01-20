'use client';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@bizflow/ui';
import { usersService } from '@/services/users.service';

interface ChangePinDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePinDialog({
  userId,
  open,
  onOpenChange,
}: ChangePinDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');

  const resetForm = () => {
    setNewPin('');
    setCurrentPin('');
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin) return;

    if (!/^\d{6}$/.test(newPin)) {
      toast.error('PIN harus terdiri dari 6 digit angka');
      return;
    }

    try {
      setIsSubmitting(true);
      await usersService.changePin(userId, {
        currentPin: currentPin || undefined,
        newPin,
      });
      toast.success('PIN berhasil diubah');
      handleOpenChange(false);
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal mengubah PIN',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Ganti PIN</DialogTitle>
            <DialogDescription>
              Masukkan PIN saat ini (jika ada) dan PIN baru Anda.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="currentPin" className="text-right">
                PIN Lama{' '}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (Opsional)
                </span>
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
                PIN Baru{' '}
                <span className="text-destructive font-bold ml-1">*</span>
              </Label>
              <Input
                id="newPin"
                type="password"
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
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || newPin.length !== 6}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan PIN'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
