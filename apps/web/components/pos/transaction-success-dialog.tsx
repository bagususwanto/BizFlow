'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@bizflow/ui';
import { CheckCircle2, Printer, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { PosTransactionResult } from './receipt/receipt-template';

interface TransactionSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: PosTransactionResult | null;
  onNewTransaction: () => void;
}

export function TransactionSuccessDialog({
  open,
  onOpenChange,
  transaction,
  onNewTransaction,
}: TransactionSuccessDialogProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    // Open print window
    window.open(
      `/pos/print/${transaction.id}`,
      'PrintReceipt',
      'width=400,height=600,resizable=yes,scrollbars=yes,status=yes',
    );
  };

  const change =
    Number(transaction.paidAmount) > Number(transaction.total)
      ? Number(transaction.paidAmount) - Number(transaction.total)
      : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/20 mb-4">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold text-success">
            Transaksi Berhasil!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="bg-muted/40 p-5 rounded-xl space-y-3 border border-border/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">
                Total Tagihan
              </span>
              <span className="font-bold text-base text-foreground">
                {formatCurrency(Number(transaction.total))}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">Bayar</span>
              <span className="font-bold text-base text-foreground">
                {formatCurrency(Number(transaction.paidAmount))}
              </span>
            </div>
            {change >= 0 && (
              <>
                <div className="border-t border-dashed border-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold">Kembalian</span>
                  <span className="text-xl font-bold text-success">
                    {formatCurrency(change)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-3 sm:justify-between w-full">
          <Button
            size="lg"
            variant="outline"
            className="flex-1 gap-2 h-12 text-base"
            onClick={handlePrint}
          >
            <Printer className="h-5 w-5" />
            Cetak Struk
          </Button>
          <Button
            size="lg"
            className="flex-1 gap-2 h-12 text-base font-semibold"
            onClick={onNewTransaction}
          >
            Transaksi Baru
            <ArrowRight className="h-5 w-5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
