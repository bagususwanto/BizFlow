'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { purchaseReturnsService } from '@/services/purchase-returns.service';

export default function PurchaseReturnPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const { data: ret, isLoading } = useQuery({
    queryKey: ['purchase-returns', resolvedParams.id],
    queryFn: () => purchaseReturnsService.getById(resolvedParams.id),
  });

  // Auto-trigger print dialog once data is loaded
  useEffect(() => {
    if (ret) {
      // Small delay to ensure the page is fully rendered
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [ret]);

  if (isLoading || !ret) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Memuat dokumen...</p>
      </div>
    );
  }

  return (
    <>
      {/* Print controls - hidden when printing */}
      <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
        <p className="text-sm text-muted-foreground">
          Pratinjau dokumen Purchase Return
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => window.close()}
            className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            Tutup
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800"
          >
            Print / Download PDF
          </button>
        </div>
      </div>

      {/* Document - shown when printing */}
      <div className="print:pt-0 pt-16 bg-gray-100 min-h-screen print:bg-white">
        <div className="max-w-[210mm] mx-auto bg-white print:shadow-none shadow-lg my-6 print:my-0 p-10 print:p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                PURCHASE RETURN
              </h1>
              <p className="text-3xl font-bold text-gray-700 mt-1">
                {ret.returnNumber}
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p className="font-semibold text-gray-900 text-base">BizFlow</p>
              <p className="mt-1">
                Tanggal:{' '}
                {format(new Date(ret.createdAt), 'dd MMMM yyyy', {
                  locale: id,
                })}
              </p>
              <div className="mt-2 inline-block border border-gray-400 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                {ret.status}
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-300 mb-6" />

          {/* Supplier Info */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Kepada Yth.
                </p>
                <p className="font-bold text-gray-900 text-lg">
                  {ret.order?.supplier?.name}
                </p>
                {ret.order?.supplier?.code && (
                  <p className="text-sm text-gray-600">
                    Kode: {ret.order.supplier.code}
                  </p>
                )}
                {ret.order?.supplier?.phone && (
                  <p className="text-sm text-gray-600">
                    Telp: {ret.order.supplier.phone}
                  </p>
                )}
                {ret.order?.supplier?.email && (
                  <p className="text-sm text-gray-600">
                    Email: {ret.order.supplier.email}
                  </p>
                )}
                {ret.order?.supplier?.address && (
                  <p className="text-sm text-gray-600 mt-1">
                    {ret.order.supplier.address}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="mt-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Referensi Purchase Order
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {ret.order?.orderNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300">
                <th className="text-left py-2 px-3 font-semibold text-gray-700 w-12">
                  No
                </th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">
                  Produk
                </th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700 w-32">
                  SKU
                </th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">
                  Alasan Return
                </th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700 w-24">
                  Qty
                </th>
              </tr>
            </thead>
            <tbody>
              {ret.items?.map((item: any, index: number) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-gray-600 align-top">
                    {index + 1}
                  </td>
                  <td className="py-2 px-3 align-top">
                    <p className="font-medium text-gray-900">
                      {item.variant?.product?.name}
                    </p>
                    {item.variant?.product?.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.variant.product.description}
                      </p>
                    )}
                  </td>
                  <td className="py-2 px-3 text-gray-600 align-top">
                    {item.variant?.sku}
                  </td>
                  <td className="py-2 px-3 text-gray-600 align-top">
                    {item.reason || '-'}
                  </td>
                  <td className="py-2 px-3 text-right font-medium align-top">
                    {Number(item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Notes */}
          {(ret.notes || ret.reason) && (
            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
              {ret.reason && (
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Alasan Pengembalian Utama
                  </p>
                  <p className="text-sm text-gray-700">{ret.reason}</p>
                </div>
              )}
              {ret.notes && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Catatan Tambahan
                  </p>
                  <p className="text-sm text-gray-700">{ret.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Signature Section */}
          <div className="grid grid-cols-3 gap-8 mt-12 page-break-inside-avoid">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-20">Dibuat oleh,</p>
              <div className="border-t border-gray-400 pt-2 mx-8">
                <p className="text-sm font-medium text-gray-700">
                  (__________________)
                </p>
                <p className="text-xs text-gray-500 mt-1">Staff Gudang</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-20">Disetujui oleh,</p>
              <div className="border-t border-gray-400 pt-2 mx-8">
                <p className="text-sm font-medium text-gray-700">
                  (__________________)
                </p>
                <p className="text-xs text-gray-500 mt-1">Manager</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-20">Diterima oleh,</p>
              <div className="border-t border-gray-400 pt-2 mx-8">
                <p className="text-sm font-medium text-gray-700">
                  (__________________)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supplier / Ekspedisi
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>
              Dokumen ini digenerate oleh sistem BizFlow pada{' '}
              {format(new Date(), 'dd MMMM yyyy HH:mm', { locale: id })}
            </p>
          </div>
        </div>
      </div>

      {/* Print-specific styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break-inside-avoid {
             break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}
