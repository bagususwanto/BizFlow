import { cn } from '@bizflow/ui';

export interface PosTransactionResult {
  id: string;
  orderNumber: string;
  orderDate: Date | string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paidAmount: number;
  customer?: { id: string; name: string; phone?: string | null } | null;
  outlet: { id: string; name: string };
  user?: { name: string };
  cashier?: { name: string };
  payments?: { method: string; amount: number; reference?: string | null }[];
  items: {
    id: string;
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    discountAmount?: number;
    variant?: { product?: { name: string }; name?: string }; // Fallback struct
  }[];
}

interface ReceiptTemplateProps {
  transaction: PosTransactionResult;
  width?: '58mm' | '80mm';
}

export function ReceiptTemplate({
  transaction,
  width = '58mm',
}: ReceiptTemplateProps) {
  const is58mm = width === '58mm';

  return (
    <div
      className={cn(
        'font-mono text-[10px] leading-tight text-black bg-white p-2',
        is58mm ? 'w-[58mm]' : 'w-[80mm]',
      )}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="font-bold text-xl uppercase mb-1">
          {transaction.outlet?.name}
        </h1>
        <p className="text-[10px] text-muted-foreground mb-px">
          Jl. Contoh No. 123, Jakarta
        </p>
        <p className="text-[10px] text-muted-foreground">
          Telp: 0812-3456-7890
        </p>
      </div>

      <div className="border-t-2 border-dashed border-black my-2" />

      {/* Info */}
      <div className="flex justify-between mb-1 text-[10px]">
        <span>No: {transaction.orderNumber}</span>
        <span>
          {new Date(transaction.orderDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      <div className="flex justify-between mb-2 text-[10px]">
        <span>Kasir: {transaction.cashier?.name || '-'}</span>
        <span>{new Date(transaction.orderDate).toLocaleDateString()}</span>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Items */}
      <div className="space-y-2 mb-2">
        {transaction.items.map((item) => (
          <div key={item.id} className="flex flex-col">
            <div className="font-bold mb-0.5 text-[11px] leading-tight">
              {(item.productName || 'Item') +
                (item.variantName ? ` - ${item.variantName}` : '')}
            </div>
            <div className="flex justify-between pl-0 text-[10px]">
              <span className="text-muted-foreground">
                {item.quantity} x {formatNumber(item.unitPrice)}
              </span>
              <span className="font-medium">
                {formatNumber(Number(item.subtotal))}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Totals */}
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatNumber(Number(transaction.subtotal))}</span>
        </div>
        {Number(transaction.discountAmount) > 0 && (
          <div className="flex justify-between text-destructive">
            <span>Diskon</span>
            <span>-{formatNumber(Number(transaction.discountAmount))}</span>
          </div>
        )}
        {Number(transaction.taxAmount) > 0 && (
          <div className="flex justify-between">
            <span>Pajak (11%)</span>
            <span>{formatNumber(Number(transaction.taxAmount))}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-[12px] mt-2 pt-1 border-t border-black">
          <span>TOTAL</span>
          <span>{formatNumber(Number(transaction.total))}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-black my-2" />

      {/* Payment */}
      <div className="space-y-1 mb-4 text-[11px]">
        {transaction.payments && transaction.payments.length > 0 ? (
          transaction.payments.map((payment, index) => (
            <div key={index} className="flex justify-between">
              <span className="capitalize">
                Bayar ({payment.method})
                {payment.reference && ` Ref: ${payment.reference}`}
              </span>
              <span>{formatNumber(Number(payment.amount))}</span>
            </div>
          ))
        ) : (
          <div className="flex justify-between">
            <span>Bayar ({transaction.payments?.[0]?.method || '-'})</span>
            <span>
              {formatNumber(Number(transaction.payments?.[0]?.amount || 0))}
            </span>
          </div>
        )}

        {Number(transaction.paidAmount) - Number(transaction.total) >= 0 && (
          <div className="flex justify-between font-bold border-t border-dashed border-black pt-1 mt-1">
            <span>Kembali</span>
            <span>
              {formatNumber(
                Number(transaction.paidAmount) - Number(transaction.total),
              )}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="font-bold text-[11px] mb-1">TERIMA KASIH</p>
        <p className="text-[10px] text-muted-foreground">
          Barang yang sudah dibeli tidak dapat ditukar/dikembalikan
        </p>
      </div>
    </div>
  );
}

function formatNumber(num: number) {
  return new Intl.NumberFormat('id-ID').format(num);
}
