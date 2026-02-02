'use client';

import { useCartStore } from '@/stores/cart.store';
import { Button } from '@bizflow/ui';
import { ScrollArea } from '@bizflow/ui';
import { Separator } from '@bizflow/ui';
import {
  Trash2,
  Plus,
  Minus,
  CreditCard,
  User,
  PauseCircle,
} from 'lucide-react';
import { cn } from '@bizflow/ui';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { CustomerSelector } from './customer-selector';
import { PaymentModal } from './payment-modal';
import { HoldTransactionDialog } from './hold-transaction-dialog';
import { useHoldTransaction } from '@/hooks/use-pos';

export interface CartSectionHandle {
  openPaymentModal: () => void;
  openCustomerSelector: () => void;
  openHoldDialog: () => void;
}

export const CartSection = forwardRef<CartSectionHandle>((props, ref) => {
  const { items, removeItem, updateQuantity, getTotal, clearCart, customer } =
    useCartStore();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);

  const holdTransaction = useHoldTransaction();

  useImperativeHandle(ref, () => ({
    openPaymentModal: () => setIsPaymentOpen(true),
    openCustomerSelector: () => setIsCustomerOpen(true),
    openHoldDialog: () => setIsHoldDialogOpen(true),
  }));

  const handleHoldTransaction = (note: string) => {
    // Construct payload
    const payload = {
      items: items.map((item) => ({
        variantId: item.variantId || item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      customerId: customer?.id,
      note: note,
    };

    holdTransaction.mutate(payload, {
      onSuccess: () => {
        setIsHoldDialogOpen(false);
        clearCart();
      },
    });
  };

  const total = getTotal();

  return (
    <div className="flex h-full flex-col">
      {/* Customer Section */}
      <div className="p-4 border-b bg-muted/20">
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between',
            !customer && 'text-muted-foreground',
          )}
          onClick={() => setIsCustomerOpen(true)}
        >
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {customer ? (
              customer.name
            ) : (
              <span>
                Pilih Pelanggan{' '}
                <span className="opacity-50 text-xs ml-1 font-mono font-normal">
                  [F3]
                </span>
              </span>
            )}
          </span>
          {customer && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Member
            </span>
          )}
        </Button>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-hidden relative">
        {items.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 opacity-50" />
            </div>
            <p className="font-medium">Keranjang Kosong</p>
            <p className="text-sm">
              Pilih produk di sebelah kiri untuk memulai transaksi
            </p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className="h-14 w-14 rounded-md bg-muted shrink-0 flex items-center justify-center text-xs font-bold text-muted-foreground overflow-hidden relative">
                    {item.imageUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v[0-9]+$/, '')}/uploads/${item.imageUrl}`}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove(
                            'hidden',
                          );
                        }}
                      />
                    ) : (
                      (item.name || item.displayName || '?')
                        .substring(0, 2)
                        .toUpperCase()
                    )}
                    {/* Fallback for error or empty (image hidden on error, this shows up) */}
                    <div className="hidden h-full w-full items-center justify-center bg-muted text-muted-foreground text-xs font-bold absolute inset-0">
                      {(item.name || item.displayName || '?')
                        .substring(0, 2)
                        .toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium line-clamp-2 leading-tight">
                        {item.name}
                      </p>
                      <p className="text-sm font-semibold tabular-nums">
                        {new Intl.NumberFormat('id-ID').format(
                          item.price * item.quantity,
                        )}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        @ {new Intl.NumberFormat('id-ID').format(item.price)}
                      </p>

                      <div className="flex items-center gap-1 bg-muted rounded-md border">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="h-6 w-6 flex items-center justify-center hover:bg-background rounded-l-md transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="h-6 w-6 flex items-center justify-center hover:bg-background rounded-r-md transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Summary & Actions */}
      <div className="p-4 border-t bg-background shadow-up">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(total)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pajak (11%)</span>
            <span>
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(0)}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-end">
            <span className="font-semibold text-lg">Total</span>
            <span className="font-bold text-2xl text-primary">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(total)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <Button
            variant="outline"
            className="col-span-1 border-destructive text-destructive hover:bg-destructive/10"
            onClick={clearCart}
            disabled={items.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="lg"
            className="col-span-2 font-semibold text-lg"
            disabled={items.length === 0}
            onClick={() => setIsPaymentOpen(true)}
          >
            Bayar
            <span className="opacity-50 text-sm ml-2 font-normal font-mono">
              [F4]
            </span>
          </Button>
          <Button
            variant="outline"
            className="col-span-1 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
            onClick={() => setIsHoldDialogOpen(true)}
            disabled={items.length === 0}
          >
            <PauseCircle className="h-4 w-4 mr-2" />
            <span className="opacity-50 text-xs font-mono font-normal">
              [F9]
            </span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      <PaymentModal
        open={isPaymentOpen}
        onOpenChange={setIsPaymentOpen}
        total={total}
      />
      <CustomerSelector
        open={isCustomerOpen}
        onOpenChange={setIsCustomerOpen}
      />
      <HoldTransactionDialog
        open={isHoldDialogOpen}
        onOpenChange={setIsHoldDialogOpen}
        onConfirm={handleHoldTransaction}
        isLoading={holdTransaction.isPending}
      />
    </div>
  );
});

CartSection.displayName = 'CartSection';
