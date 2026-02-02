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

  const handleConfirm = () => {
    approve({ id, data: { notes } }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setujui Retur?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Retur akan disetujui dan stok akan ditambahkan kembali ke
            inventaris.
          </p>
          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Textarea
              placeholder="Catatan approval..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Setujui
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
          <DialogTitle>Tolak Retur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Alasan Penolakan <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="Contoh: Kondisi fisik barang ..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Catatan (Opsional)</Label>
            <Textarea
              placeholder="Tambahan info..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !reason}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tolak Retur
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
          <DialogTitle>Proses Refund</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-muted p-3 rounded-md text-center">
            <span className="text-sm text-muted-foreground block mb-1">
              Total Refund
            </span>
            <span className="text-2xl font-bold">{formatCurrency(amount)}</span>
          </div>

          <div className="space-y-2">
            <Label>Metode Refund</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Tunai</SelectItem>
                <SelectItem value="transfer">Transfer Bank</SelectItem>
                {/* <SelectItem value="credit">Store Credit</SelectItem> Logic store credit might need customer wallet */}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Akun Kas/Bank</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun..." />
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
            <Label>Catatan</Label>
            <Textarea
              placeholder="No. Ref / Info transfer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={isPending || !accountId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proses
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
