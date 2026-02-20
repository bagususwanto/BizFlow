'use client';

import { use, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { purchaseOrdersService } from '@/services/purchase-orders.service';
import { formatCurrency } from '@bizflow/ui';

export default function PurchaseOrderPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  const { data: order, isLoading } = useQuery({
    queryKey: ['purchase-orders', resolvedParams.id],
    queryFn: () => purchaseOrdersService.getById(resolvedParams.id),
  });

  // Auto-trigger print dialog once data is loaded
  useEffect(() => {
    if (order) {
      // Small delay to ensure the page is fully rendered
      const timer = setTimeout(() => window.print(), 500);
      return () => clearTimeout(timer);
    }
  }, [order]);

  if (isLoading || !order) {
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
          Pratinjau dokumen Purchase Order
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
                PURCHASE ORDER
              </h1>
              <p className="text-3xl font-bold text-gray-700 mt-1">
                {order.orderNumber}
              </p>
            </div>
            <div className="text-right text-sm text-gray-600">
              <p className="font-semibold text-gray-900 text-base">BizFlow</p>
              <p className="mt-1">
                Tanggal:{' '}
                {format(new Date(order.createdAt), 'dd MMMM yyyy', {
                  locale: id,
                })}
              </p>
              {order.expectedDate && (
                <p>
                  Exp. Tiba:{' '}
                  {format(new Date(order.expectedDate), 'dd MMMM yyyy', {
                    locale: id,
                  })}
                </p>
              )}
              <div className="mt-2 inline-block border border-gray-400 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                {order.status}
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-300 mb-6" />

          {/* Supplier Info */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Kepada Yth.
            </p>
            <p className="font-bold text-gray-900 text-lg">
              {order.supplier?.name}
            </p>
            {order.supplier?.code && (
              <p className="text-sm text-gray-600">
                Kode: {order.supplier.code}
              </p>
            )}
            {order.supplier?.phone && (
              <p className="text-sm text-gray-600">
                Telp: {order.supplier.phone}
              </p>
            )}
            {order.supplier?.email && (
              <p className="text-sm text-gray-600">
                Email: {order.supplier.email}
              </p>
            )}
            {order.supplier?.address && (
              <p className="text-sm text-gray-600 mt-1">
                {order.supplier.address}
              </p>
            )}
          </div>

          {/* Items Table */}
          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="bg-gray-100 border-y border-gray-300">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">
                  No
                </th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">
                  Produk
                </th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700">
                  SKU
                </th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">
                  Qty
                </th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">
                  Harga Satuan
                </th>
                <th className="text-right py-2 px-3 font-semibold text-gray-700">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item: any, index: number) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="py-2 px-3 text-gray-600">{index + 1}</td>
                  <td className="py-2 px-3">
                    <p className="font-medium text-gray-900">
                      {item.variant?.product?.name}
                    </p>
                  </td>
                  <td className="py-2 px-3 text-gray-600">
                    {item.variant?.sku}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {Number(item.quantity)}
                  </td>
                  <td className="py-2 px-3 text-right">
                    {formatCurrency(Number(item.unitPrice))}
                  </td>
                  <td className="py-2 px-3 text-right font-medium">
                    {formatCurrency(Number(item.subtotal))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-1 text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>Diskon ({Number(order.discountPercent)}%)</span>
                  <span>- {formatCurrency(Number(order.discountAmount))}</span>
                </div>
              )}
              {Number(order.taxAmount) > 0 && (
                <div className="flex justify-between py-1 text-sm text-gray-600">
                  <span>Pajak ({Number(order.taxPercent)}%)</span>
                  <span>+ {formatCurrency(Number(order.taxAmount))}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-base font-bold text-gray-900 border-t border-gray-300 mt-1">
                <span>TOTAL</span>
                <span>{formatCurrency(Number(order.total))}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="mb-8 p-4 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Catatan
              </p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Signature Section */}
          <div className="grid grid-cols-2 gap-16 mt-12 mb-8">
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-20 text-center">
                Dibuat oleh,
              </p>
              <div className="w-48 text-center">
                <p className="text-sm font-bold text-gray-900 border-b border-gray-900 pb-1">
                  {order.creator?.name ||
                    order.createdBy ||
                    '__________________'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Staf Purchasing</p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 mb-20 text-center">
                Disetujui oleh,
              </p>
              <div className="w-48 text-center">
                <p className="text-sm font-bold text-gray-900 border-b border-gray-900 pb-1">
                  {order.approver?.name || '__________________'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Manager</p>
                {order.approvedAt && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    {format(new Date(order.approvedAt), 'dd/MM/yyyy HH:mm', {
                      locale: id,
                    })}
                  </p>
                )}
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
        }
      `}</style>
    </>
  );
}
