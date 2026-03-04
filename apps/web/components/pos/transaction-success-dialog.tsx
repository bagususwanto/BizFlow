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
import { useDefaultPrinter, usePrintTransaction } from '@/hooks/use-printers';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

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
  const { data: defaultPrinter, isLoading: isLoadingPrinter } =
    useDefaultPrinter(transaction?.outlet?.id);
  const { mutate: printTransaction, isPending: isPrinting } =
    usePrintTransaction();
  const t = useTranslations('pos.transactionSuccess');

  if (!transaction) return null;

  const handlePrint = async () => {
    // Debug logging
    console.log('🖨️ Print button clicked');
    console.log('electronAPI available:', !!(window as any).electronAPI);
    console.log('Default printer:', defaultPrinter);

    // 1. If Electron app & USB printer -> Use Electron IPC
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).electronAPI && defaultPrinter?.type === 'usb') {
      try {
        // Format receipt data for Electron
        const receiptData = {
          header: {
            companyName: transaction.outlet?.name || 'BizFlow',
            address: undefined, // Can be added from outlet data if available
            phone: undefined,
          },
          orderNumber: transaction.orderNumber,
          orderDate: transaction.orderDate,
          cashier:
            transaction.cashier?.name || transaction.user?.name || 'Kasir',
          customer: transaction.customer
            ? {
                name: transaction.customer.name,
                phone: transaction.customer.phone || undefined,
              }
            : undefined,
          items: transaction.items.map((item) => ({
            name: item.variantName
              ? `${item.productName} - ${item.variantName}`
              : item.productName,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.subtotal),
            discount: item.discountAmount
              ? Number(item.discountAmount)
              : undefined,
          })),
          subtotal: Number(transaction.subtotal),
          discount: transaction.discountAmount
            ? Number(transaction.discountAmount)
            : undefined,
          tax: transaction.taxAmount
            ? Number(transaction.taxAmount)
            : undefined,
          total: Number(transaction.total),
          payments:
            transaction.payments?.map((p) => ({
              method: p.method,
              amount: Number(p.amount),
              reference: p.reference || undefined,
            })) || [],
          change: Math.max(
            0,
            Number(transaction.paidAmount) - Number(transaction.total),
          ),
          footer: {
            message:
              'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan',
            thankYou: 'TERIMA KASIH',
          },
        };

        const result = await (window as any).electronAPI.printReceipt({
          receiptData,
          printerName: defaultPrinter.address || defaultPrinter.name,
          width: defaultPrinter.width || 58,
        });

        if (result.success) {
          toast.success(t('printSuccess'));
        } else {
          toast.error(
            t('printFailed', { error: result.error || 'Unknown error' }),
          );
        }
      } catch (error: any) {
        toast.error(
          t('printFailed', { error: error.message || 'Unknown error' }),
        );
      }
      return;
    }

    // 2. If Network printer -> Use API
    if (defaultPrinter?.type === 'network') {
      printTransaction({
        printerId: defaultPrinter.id,
        transactionId: transaction.id,
      });
      return;
    }

    // 3. Fallback -> Browser Print
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
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="bg-muted/40 p-5 rounded-xl space-y-3 border border-border/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">
                {t('totalBill')}
              </span>
              <span className="font-bold text-base text-foreground">
                {formatCurrency(Number(transaction.total))}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium">
                {t('paidAmount')}
              </span>
              <span className="font-bold text-base text-foreground">
                {formatCurrency(Number(transaction.paidAmount))}
              </span>
            </div>
            {change >= 0 && (
              <>
                <div className="border-t border-dashed border-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold">
                    {t('changeAmount')}
                  </span>
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
            disabled={isPrinting || isLoadingPrinter}
          >
            <Printer className="h-5 w-5" />
            {isPrinting ? t('printing') : t('printReceipt')}
          </Button>
          <Button
            size="lg"
            className="flex-1 gap-2 h-12 text-base font-semibold"
            onClick={onNewTransaction}
          >
            {t('newTransaction')}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
