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
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('pos.held');

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
            <DialogTitle>{t('saveDialogTitle')}</DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">{t('saveDialogDesc')}</p>

          <div className="space-y-2">
            <Label htmlFor="note">{t('noteOptional')}</Label>
            <Textarea
              id="note"
              placeholder={t('saveNotePlaceholder')}
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
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                t('saving')
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t('saveBtn')}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
