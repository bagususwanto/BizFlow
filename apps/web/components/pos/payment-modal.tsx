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

  // Split payment state
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [splitPayments, setSplitPayments] = useState<
    { method: string; amount: number; reference?: string; accountId: string }[]
  >([]);
  const [splitAmount, setSplitAmount] = useState('');
  const [splitMethod, setSplitMethod] = useState('cash');
  const [splitReference, setSplitReference] = useState('');

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

  // Calculate change for single payment
  const change =
    method === 'cash' ? Math.max(0, (Number(cashAmount) || 0) - total) : 0;

  // Calculate totals for split payment
  const totalPaid = splitPayments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);
  const splitChange = Math.max(0, totalPaid - total);

  const handleAddSplitPayment = () => {
    const amount = Number(splitAmount);
    if (!amount || amount <= 0) {
      toast.error('Jumlah pembayaran tidak valid');
      return;
    }

    let accountId = '';
    if (splitMethod === 'cash') {
      const cashAccount = accounts.find(
        (a) => a.code === 'CASH' || a.type === 'cash',
      );
      accountId = cashAccount?.id || accounts[0]?.id;
    } else {
      accountId = accounts[0]?.id;
    }

    if (!accountId) {
      toast.error('Akun pembayaran tidak tersedia');
      return;
    }

    setSplitPayments([
      ...splitPayments,
      {
        method: splitMethod,
        amount,
        reference: splitReference,
        accountId,
      },
    ]);

    // Reset form
    setSplitAmount('');
    setSplitReference('');
    setSplitMethod('cash');
  };

  const handleRemoveSplitPayment = (index: number) => {
    const newPayments = [...splitPayments];
    newPayments.splice(index, 1);
    setSplitPayments(newPayments);
  };

  const handleProcess = () => {
    if (!user?.outlets?.[0]) {
      toast.error('Outlet tidak ditemukan pada user');
      return;
    }

    const payloadItems = items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId || item.id,
      quantity: item.quantity,
      unitPrice: item.price,
      discountPercent: item.discountPercent,
      discountAmount: item.discountAmount,
    }));

    const commonPayload = {
      outletId: user.outlets[0],
      items: payloadItems,
      customerId: customer?.id,
      discountPercent: discount?.type === 'percent' ? discount.value : 0,
      discountAmount: discount?.type === 'fixed' ? discount.value : 0,
      notes,
    };

    let finalPayments: any[] = [];

    if (isSplitMode) {
      if (totalPaid < total) {
        toast.error(`Pembayaran kurang ${formatCurrency(remaining)}`);
        return;
      }
      finalPayments = splitPayments;
    } else {
      // Single payment validation
      if (method === 'cash' && (Number(cashAmount) || 0) < total) {
        toast.error('Nominal uang kurang dari total bayar');
        return;
      }

      let accountId = '';
      if (method === 'cash') {
        const cashAccount = accounts.find(
          (a) => a.code === 'CASH' || a.type === 'cash',
        );
        accountId = cashAccount?.id || accounts[0]?.id;
      } else {
        accountId = accounts[0]?.id;
      }

      if (!accountId) {
        toast.error('Akun pembayaran tidak tersedia. Hubungi admin.');
        return;
      }

      finalPayments = [
        {
          method,
          amount: method === 'cash' ? Number(cashAmount) || total : total,
          reference,
          accountId,
        },
      ];
    }

    createTransaction(
      {
        ...commonPayload,
        payments: finalPayments,
      },
      {
        onSuccess: (data) => {
          toast.success(
            `Transaksi berhasil! Pembayaran: ${formatCurrency(total)}`,
          );

          setLastTransaction(data.data);
          setShowSuccess(true);
          clearCart();
          onOpenChange(false);

          // Reset states
          setCashAmount('');
          setReference('');
          setNotes('');
          setMethod('cash');
          setIsSplitMode(false);
          setSplitPayments([]);
        },
      },
    );
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      setCashAmount('');
      // Auto-fill split amount with remaining if in split mode
      if (isSplitMode && remaining > 0) {
        setSplitAmount(remaining.toString());
      }
    }
  }, [open, isSplitMode, remaining]);

  return (
    <>
      <TransactionSuccessDialog
        open={showSuccess}
        onOpenChange={handleCloseSuccess}
        transaction={lastTransaction}
        onNewTransaction={handleCloseSuccess}
      />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Pembayaran</span>
              <Button
                variant={isSplitMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsSplitMode(!isSplitMode)}
                className="mr-6"
              >
                {isSplitMode ? 'Mode Tunggal' : 'Bayar Split'}
              </Button>
            </DialogTitle>
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

            {isSplitMode ? (
              <div className="space-y-4">
                {/* List of added payments */}
                {splitPayments.length > 0 && (
                  <div className="space-y-2 border rounded-md p-2 max-h-[150px] overflow-y-auto">
                    {splitPayments.map((p, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium capitalize">
                            {p.method}
                          </span>
                          {p.reference && (
                            <span className="text-xs text-muted-foreground">
                              {p.reference}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{formatCurrency(p.amount)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleRemoveSplitPayment(i)}
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}

                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Dibayar:</span>
                      <span
                        className={
                          totalPaid >= total ? 'text-success' : 'text-primary'
                        }
                      >
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                    {totalPaid > total && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Kembalian:</span>
                        <span>{formatCurrency(totalPaid - total)}</span>
                      </div>
                    )}
                  </div>
                )}

                {remaining > 0 ? (
                  <div className="border p-4 rounded-md space-y-3 bg-muted/10">
                    <div className="text-sm font-medium mb-2">
                      Tambah Pembayaran ({formatCurrency(remaining)})
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={splitMethod}
                        onChange={(e) => setSplitMethod(e.target.value)}
                      >
                        <option value="cash">Tunai</option>
                        <option value="qris">QRIS</option>
                        <option value="transfer">Transfer</option>
                        <option value="credit">Kartu Kredit</option>
                        <option value="debit">Kartu Debit</option>
                      </select>
                      <Input
                        type="number"
                        placeholder="Nominal..."
                        value={splitAmount}
                        onChange={(e) => setSplitAmount(e.target.value)}
                        onFocus={() => {
                          if (!splitAmount)
                            setSplitAmount(remaining.toString());
                        }}
                      />
                    </div>
                    {(splitMethod === 'transfer' ||
                      splitMethod === 'qris' ||
                      splitMethod.includes('card')) && (
                      <Input
                        placeholder="Referensi / No. Kartu (Opsional)..."
                        value={splitReference}
                        onChange={(e) => setSplitReference(e.target.value)}
                      />
                    )}
                    <Button
                      onClick={handleAddSplitPayment}
                      className="w-full"
                      variant="secondary"
                    >
                      Tambah Pembayaran
                    </Button>
                  </div>
                ) : (
                  <div className="text-center p-4 text-success font-medium bg-success/10 rounded-md">
                    Pembayaran Lunas
                  </div>
                )}
              </div>
            ) : (
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
                          className={`text-lg font-bold ${change < 0 ? 'text-destructive' : 'text-success'}`}
                        >
                          {formatCurrency(change)}
                        </span>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="qris" className="space-y-4">
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-white">
                      {/* Static QRIS Placeholder */}
                      <div className="w-48 h-48 bg-white p-2 border mb-4">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://example.com/pay"
                          alt="QRIS Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="font-bold text-center">SCAN QRIS</p>
                      <p className="text-center text-sm text-muted-foreground mt-1">
                        Scan QR di atas untuk pembayaran
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
                      <Label>Referensi / Bukti Transfer (Opsional)</Label>
                      <Input
                        placeholder="Masukkan nomor referensi..."
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Catatan (Opsional)</Label>
                      <Input
                        placeholder="Catatan tambahan..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            )}
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
                  (!isSplitMode &&
                    method === 'cash' &&
                    (Number(cashAmount) || 0) < total) ||
                  (isSplitMode && totalPaid < total)
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
