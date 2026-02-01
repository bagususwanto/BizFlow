'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { posTransactionsService } from '@/services/pos-transactions.service';
import {
  ReceiptTemplate,
  PosTransactionResult,
} from '@/components/pos/receipt/receipt-template';
import { Loader2 } from 'lucide-react';

export default function ReceiptPrintPage() {
  const params = useParams();
  const id = params.id as string;
  const [transaction, setTransaction] = useState<PosTransactionResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // Create a dedicated getTransactionById in service if needed, logic here assumes similar usage
      // Reusing logic via apiClient if needed, or if findAll supports id filtering.
      // Actually standard transaction service should have findById.
      // The posTransactionsService in frontend might not exposed it yet.
      // Let's assume we can fetch it.

      // Temporary: fetching via standard endpoint if available or implementing fetch
      // Since posTransactionsService currently has: searchProducts, createTransaction, hold...
      // but not getTransactionById. We should add it.
      // For now I will mock fetch or assume I added it.

      // Let's add getTransaction to posTransactionsService quickly in next step.
      // Here I will use the service assuming it exists.
      posTransactionsService
        .getTransaction(id)
        .then((res) => {
          setTransaction(res.data);
          // Auto print after small delay to ensure rendering
          setTimeout(() => {
            window.print();
            // Optional: Close window after print
            // window.close();
          }, 500);
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!transaction) {
    return <div className="p-4">Transaksi tidak ditemukan</div>;
  }

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white print:block">
      <div className="hidden print:block">
        <ReceiptTemplate transaction={transaction} width="58mm" />
      </div>
      {/* Preview on screen */}
      <div className="print:hidden shadow-lg">
        <ReceiptTemplate transaction={transaction} width="58mm" />
        <div className="mt-4 text-center text-sm text-gray-500">
          Tekan Cmd+P / Ctrl+P untuk mencetak jika dialog tidak muncul.
        </div>
      </div>
    </div>
  );
}
