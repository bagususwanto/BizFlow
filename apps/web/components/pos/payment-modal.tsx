'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
} from '@bizflow/ui';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { useCreateTransaction, usePosAccounts } from '@/hooks/use-pos';
import { useState, useEffect } from 'react';
import { Banknote, CreditCard, QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { TransactionSuccessDialog } from './transaction-success-dialog';
import { PosTransactionResult } from './receipt/receipt-template';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
}

export function PaymentModal({ open, onOpenChange, total }: PaymentModalProps) {
  const { user } = useAuthStore();
  const { items, customer, clearCart, discount } = useCartStore();
  const { mutate: createTransaction, isPending } = useCreateTransaction();
  const { data: accountsData } = usePosAccounts();
  const accounts = accountsData?.data || [];

  const [method, setMethod] = useState('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const [lastTransaction, setLastTransaction] =
    useState<PosTransactionResult | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Quick cash buttons
  const quickCash = [
    total,
    Math.ceil(total / 10000) * 10000,
    Math.ceil(total / 50000) * 50000,
    Math.ceil(total / 100000) * 100000,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total);

  // Add common denominations if exact amount is only option
  if (quickCash.length < 3) {
    if (total < 50000) quickCash.push(50000);
    if (total < 100000) quickCash.push(100000);
  }

  const change =
    method === 'cash' ? Math.max(0, (Number(cashAmount) || 0) - total) : 0;

  const handleProcess = () => {
    // Validation
    if (method === 'cash' && (Number(cashAmount) || 0) < total) {
      toast.error('Nominal uang kurang dari total bayar');
      return;
    }

    if (!user?.outlets?.[0]) {
      toast.error('Outlet tidak ditemukan pada user');
      return;
    }

    // Determine account ID based on payment method or default
    // For 'cash', try to find 'cash' type account or use 'CASH' code if available
    let accountId = '';

    // Find cash account for cash payment
    if (method === 'cash') {
      const cashAccount = accounts.find(
        (a) => a.code === 'CASH' || a.type === 'cash',
      );
      accountId = cashAccount?.id || accounts[0]?.id;
    } else {
      // For other methods, ideally allow selection, but for now fallback to first account
      accountId = accounts[0]?.id;
    }

    if (!accountId) {
      toast.error('Akun pembayaran tidak tersedia. Hubungi admin.');
      return;
    }

    // Construct payload
    const payload = {
      outletId: user.outlets[0],
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || item.id, // Fallback to item.id (which is variantId || productId from cart logic)
        quantity: item.quantity,
        unitPrice: item.price, // Changed to unitPrice
      })),
      payments: [
        {
          method,
          amount: method === 'cash' ? Number(cashAmount) || total : total,
          reference,
          accountId, // Added accountId
        },
      ],
      customerId: customer?.id,
      discountPercent: discount?.type === 'percent' ? discount.value : 0,
      discountAmount: discount?.type === 'fixed' ? discount.value : 0,
      notes,
    };

    createTransaction(payload, {
      onSuccess: (data) => {
        toast.success(
          `Transaksi berhasil! Pembayaran: ${formatCurrency(total)}`,
        );

        setLastTransaction(data.data);
        setShowSuccess(true);
        clearCart();
        // Close payment modal so only success dialog is visible
        onOpenChange(false);
        setCashAmount('');
        setReference('');
        setNotes('');
        setMethod('cash');
      },
    });
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setCashAmount('');
    }
  }, [open]);

  return (
    <>
      <TransactionSuccessDialog
        open={showSuccess}
        onOpenChange={handleCloseSuccess}
        transaction={lastTransaction}
        onNewTransaction={handleCloseSuccess}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="flex flex-col items-center justify-center space-y-2 bg-muted/20 p-4 rounded-lg">
              <span className="text-sm text-muted-foreground">
                Total Tagihan
              </span>
              <span className="text-4xl font-bold text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            <Tabs
              defaultValue="cash"
              value={method}
              onValueChange={setMethod}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="cash">
                  <Banknote className="mr-2 h-4 w-4" /> Tunai
                </TabsTrigger>
                <TabsTrigger value="qris">
                  <QrCode className="mr-2 h-4 w-4" /> QRIS
                </TabsTrigger>
                <TabsTrigger value="transfer">
                  <CreditCard className="mr-2 h-4 w-4" /> Transfer
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-4">
                <TabsContent value="cash" className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Nominal Uang</Label>
                    <Input
                      type="number"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      placeholder="Masukkan jumlah uang..."
                      className="text-lg"
                      autoFocus
                    />
                    <div className="flex gap-2 flex-wrap">
                      {quickCash.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setCashAmount(amount.toString())}
                          className="flex-1"
                        >
                          {formatCurrency(amount)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {Number(cashAmount) > 0 && (
                    <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                      <span className="font-medium">Kembalian</span>
                      <span
                        className={`text-lg font-bold ${change < 0 ? 'text-destructive' : 'text-green-600'}`}
                      >
                        {formatCurrency(change)}
                      </span>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="qris" className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                    <QrCode className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-center text-muted-foreground">
                      Scan QRIS pada alat EDC atau tampilkan QRIS Statis.
                    </p>
                    <p className="font-medium mt-2 text-center text-primary">
                      Menunggu Implementasi QRIS
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Referensi (Opsional)</Label>
                    <Input
                      placeholder="No. Ref / Approval Code"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="transfer" className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Referensi / Bukti Transfer</Label>
                    <Input
                      placeholder="Masukkan nomor referensi..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Catatan</Label>
                    <Input
                      placeholder="Catatan tambahan..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <DialogFooter className="sm:justify-between">
            <div className="text-xs text-muted-foreground self-center hidden sm:block">
              {items.length} item(s) • Pelanggan:{' '}
              {customer ? customer.name : 'Umum'}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Batal
              </Button>
              <Button
                onClick={handleProcess}
                disabled={
                  isPending ||
                  (method === 'cash' && (Number(cashAmount) || 0) < total)
                }
                className="flex-1 sm:flex-none min-w-[120px]"
              >
                {isPending ? 'Memproses...' : 'Bayar'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
