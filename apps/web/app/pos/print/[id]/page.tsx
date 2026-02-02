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
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>('58mm');

  useEffect(() => {
    if (id) {
      posTransactionsService
        .getTransaction(id)
        .then((res) => {
          setTransaction(res.data);
          // Auto print after small delay to ensure rendering
          setTimeout(() => {
            window.print();
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
        <ReceiptTemplate transaction={transaction} width={paperSize} />
      </div>
      {/* Preview on screen */}
      <div className="print:hidden flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm w-full max-w-xs flex justify-center gap-2">
          <button
            onClick={() => setPaperSize('58mm')}
            className={`px-3 py-1 text-sm rounded-md border ${
              paperSize === '58mm'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            58mm
          </button>
          <button
            onClick={() => setPaperSize('80mm')}
            className={`px-3 py-1 text-sm rounded-md border ${
              paperSize === '80mm'
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            80mm
          </button>
        </div>

        <div className="shadow-lg bg-white">
          <ReceiptTemplate transaction={transaction} width={paperSize} />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Tekan Cmd+P / Ctrl+P untuk mencetak</p>
          <button
            onClick={() => window.print()}
            className="mt-2 text-blue-600 hover:underline font-medium"
          >
            Print Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
