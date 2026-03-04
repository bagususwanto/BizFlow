'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { useState } from 'react';
// Hooks from use-returns and use-pos
import {
  useApproveReturn as useApprove,
  useRejectReturn as useReject,
  useProcessRefund as useRefund,
} from '@/hooks/use-returns';
import { usePosAccounts as useAccounts } from '@/hooks/use-pos';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';

// ==========================================
// Approve Dialog
// ==========================================
interface ApproveDialogProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApproveReturnDialog({
  id,
  open,
  onOpenChange,
}: ApproveDialogProps) {
  const [notes, setNotes] = useState('');
  const { mutate: approve, isPending } = useApprove();
  const t = useTranslations('pos.returns.dialogs');

  const handleConfirm = () => {
    approve({ id, data: { notes } }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('approveTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">{t('approveDesc')}</p>
          <div className="space-y-2">
            <Label>{t('noteOptional')}</Label>
            <Textarea
              placeholder={t('approveNotePlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('approveBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// Reject Dialog
// ==========================================
interface RejectDialogProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectReturnDialog({
  id,
  open,
  onOpenChange,
}: RejectDialogProps) {
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const { mutate: reject, isPending } = useReject();
  const t = useTranslations('pos.returns.dialogs');

  const handleConfirm = () => {
    if (!reason) return;
    reject(
      { id, data: { reason, notes } },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('rejectTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              {t('rejectReason')} <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder={t('rejectReasonPlaceholder')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('noteOptional')}</Label>
            <Textarea
              placeholder={t('additionalInfoPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !reason}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('rejectBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ==========================================
// Refund Dialog
// ==========================================
interface RefundDialogProps {
  id: string;
  amount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcessRefundDialog({
  id,
  amount,
  open,
  onOpenChange,
}: RefundDialogProps) {
  const [method, setMethod] = useState('cash');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');

  const { mutate: processRefund, isPending } = useRefund();
  const { data: accountsData } = useAccounts();
  const t = useTranslations('pos.returns.dialogs');

  const accounts = accountsData?.data || [];

  const handleConfirm = () => {
    if (!accountId) return;
    processRefund(
      { id, data: { refundMethod: method as any, accountId, notes } },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('processRefundTitle')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-md text-center">
            <span className="text-sm text-muted-foreground block mb-1">
              {t('totalRefund')}
            </span>
            <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
          </div>

          <div className="space-y-2">
            <Label>{t('refundMethod')}</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t('cash')}</SelectItem>
                <SelectItem value="transfer">{t('bankTransfer')}</SelectItem>
                {/* <SelectItem value="credit">Store Credit</SelectItem> Logic store credit might need customer wallet */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('account')}</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder={t('selectAccount')} />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('note')}</Label>
            <Textarea
              placeholder={t('refInfoPlaceholder')}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || !accountId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('processBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
