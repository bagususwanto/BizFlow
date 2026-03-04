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

import { useTranslations } from 'next-intl';

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
  title,
  description,
  onConfirm,
  isDeleting = false,
  confirmLabel,
  cancelLabel,
  variant = 'destructive',
  showConfirm = true,
}: DeleteConfirmDialogProps) {
  const t = useTranslations('common');

  const displayTitle = title || t('confirmDeleteTitle');
  const displayDesc = description || t('confirmDeleteDesc');
  const displayConfirm = confirmLabel || t('delete');
  const displayCancel = cancelLabel || t('cancel');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{displayTitle}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-muted-foreground">{displayDesc}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {displayCancel}
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
              {isDeleting ? t('processing') : displayConfirm}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
