'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Label,
  Input,
  Textarea,
} from '@bizflow/ui';
import { PauseCircle, Save } from 'lucide-react';

interface HoldTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (note: string) => void;
  isLoading?: boolean;
}

export function HoldTransactionDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: HoldTransactionDialogProps) {
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(note);
    setNote('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PauseCircle className="h-6 w-6 text-warning" />
            <DialogTitle>Simpan Transaksi</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            Transaksi saat ini akan disimpan sementara dan keranjang akan
            dikosongkan. Anda dapat melanjutkannya nanti melalui menu "Transaksi
            Tersimpan".
          </p>

          <div className="space-y-2">
            <Label htmlFor="note">Catatan (Opsional)</Label>
            <Textarea
              id="note"
              placeholder="Contoh: Pelanggan ambil dompet"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                'Menyimpan...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Simpan
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
