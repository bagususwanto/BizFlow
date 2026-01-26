'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@bizflow/ui';
import { ReactNode } from 'react';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  onConfirm?: () => void;
  isDeleting?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  showConfirm?: boolean;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  title = 'Apakah anda yakin?',
  description = 'Tindakan ini tidak dapat dibatalkan. Data akan dihapus secara permanen.',
  onConfirm,
  isDeleting = false,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  variant = 'destructive',
  showConfirm = true,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-muted-foreground">{description}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {cancelLabel}
          </AlertDialogCancel>
          {showConfirm && (
            <AlertDialogAction
              className={
                variant === 'destructive'
                  ? 'bg-destructive hover:bg-destructive/80'
                  : ''
              }
              onClick={(e) => {
                e.preventDefault();
                onConfirm?.();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? 'Memproses...' : confirmLabel}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
