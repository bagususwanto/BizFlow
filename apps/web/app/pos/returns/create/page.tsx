'use client';

import { PosHeader } from '@/components/pos/pos-header';
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@bizflow/ui';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { usePosTransactions } from '@/hooks/use-pos';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import {
  ReturnItemSelector,
  ReturnItem,
} from '@/components/pos/returns/return-item-selector';
import { useCreateReturn } from '@/hooks/use-returns';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function CreateReturnPage() {
  const t = useTranslations('pos.returns.create');
  const [orderNumber, setOrderNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);

  // Form State
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState('cash');

  const { data: searchData, isFetching } = usePosTransactions({
    search: searchQuery,
    page: 1,
    pageSize: 5,
    enabled: !!searchQuery,
  });

  const { mutate: createReturn, isPending } = useCreateReturn();

  const handleSearch = () => {
    if (!orderNumber) return;
    setSearchQuery(orderNumber);
    setSelectedTransaction(null);
    setReturnItems([]);
  };

  const handleSelectTransaction = (trx: any) => {
    setSelectedTransaction(trx);
    setSearchQuery(''); // Clear search to hide list
    setOrderNumber(trx.orderNumber);
    setReturnItems([]);
  };

  const handleSubmit = () => {
    if (!selectedTransaction) return;
    if (returnItems.length === 0) {
      toast.error(t('errorNoItems') || 'Pilih minimal 1 barang untuk diretur');
      return;
    }

    if (!reason) {
      toast.error(t('errorNoReason') || 'Alasan retur wajib diisi');
      return;
    }

    const payload = {
      orderId: selectedTransaction.id,
      items: returnItems.map((item) => ({
        orderItemId: item.orderItemId,
        quantity: item.quantity,
        reason: item.reason || reason, // Use per-item reason or global reason
      })),
      reason,
      refundMethod: refundMethod as any,
      notes,
    };

    createReturn(payload);
  };

  return (
    <div className="flex flex-col h-screen bg-muted/10">
      <PosHeader
        backHref="/pos/returns"
        backLabel={t('backLabel') || 'Riwayat Retur'}
      />

      <div className="flex-1 p-6 space-y-6 overflow-auto max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <Link href="/pos/returns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            {t('title') || 'Buat Retur Baru'}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('searchTitle') || 'Cari Transaksi'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder={
                  t('searchPlaceholder') ||
                  'Masukkan Nomor Order (Contoh: ORD-...)'
                }
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isFetching}>
                {isFetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {t('searchBtn') || 'Cari'}
              </Button>
            </div>

            {/* Search Results */}
            {searchQuery && searchData?.data?.data && (
              <div className="border rounded-md mt-2 divide-y">
                {searchData.data.data.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    {t('notFound') || 'Transaksi tidak ditemukan.'}
                  </div>
                ) : (
                  searchData.data.data.map((trx: any) => (
                    <div
                      key={trx.id}
                      className="p-3 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                      onClick={() => handleSelectTransaction(trx)}
                    >
                      <div>
                        <p className="font-medium">{trx.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(
                            new Date(trx.createdAt),
                            'dd MMM yyyy HH:mm',
                            { locale: idLocale },
                          )}
                          {' • '}
                          {trx.customer?.name ||
                            t('generalCustomer') ||
                            'Pelanggan Umum'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(Number(trx.total))}
                        </p>
                        <Badge
                          variant={
                            trx.status === 'completed' ? 'success' : 'secondary'
                          }
                        >
                          {trx.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {selectedTransaction && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <Card>
              <CardHeader>
                <CardTitle className="justify-between flex items-center">
                  <span>
                    {t('detailTitle') || 'Detail Transaksi:'}{' '}
                    {selectedTransaction.orderNumber}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTransaction(null)}
                  >
                    {t('changeBtn') || 'Ganti'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">
                      {t('date') || 'Tanggal'}
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(selectedTransaction.createdAt),
                        'dd MMM yyyy HH:mm',
                        { locale: idLocale },
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t('customer') || 'Pelanggan'}
                    </p>
                    <p className="font-medium">
                      {selectedTransaction.customer?.name ||
                        t('generalCustomer') ||
                        'Umum'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t('cashier') || 'Kasir'}
                    </p>
                    <p className="font-medium">
                      {selectedTransaction.user?.username || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      {t('total') || 'Total'}
                    </p>
                    <p className="font-medium">
                      {formatCurrency(Number(selectedTransaction.total))}
                    </p>
                  </div>
                </div>

                <Separator className="my-4" />

                <Label className="mb-2 block">
                  {t('selectItems') || 'Pilih Barang untuk Diretur'}
                </Label>
                <ReturnItemSelector
                  items={selectedTransaction.items}
                  onChange={setReturnItems}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('returnInfo') || 'Info Pengembalian'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('mainReason') || 'Alasan Utama'}</Label>
                    <Select value={reason} onValueChange={setReason}>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            t('reasonPlaceholder') || 'Pilih alasan retur'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="defective">
                          {t('reasons.defective') || 'Barang Rusak / Cacat'}
                        </SelectItem>
                        <SelectItem value="wrong_item">
                          {t('reasons.wrong_item') || 'Salah Barang'}
                        </SelectItem>
                        <SelectItem value="expired">
                          {t('reasons.expired') || 'Kadaluarsa'}
                        </SelectItem>
                        <SelectItem value="customer_change">
                          {t('reasons.customer_change') ||
                            'Berubah Pikiran (Tukar)'}
                        </SelectItem>
                        <SelectItem value="other">
                          {t('reasons.other') || 'Lainnya'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {t('refundMethodLabel') ||
                        'Metode Refund (Jika disetujui)'}
                    </Label>
                    <Select
                      value={refundMethod}
                      onValueChange={setRefundMethod}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            t('refundMethodPlaceholder') || 'Pilih metode'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">
                          {t('refundMethods.cash') || 'Tunai'}
                        </SelectItem>
                        <SelectItem value="transfer">
                          {t('refundMethods.transfer') || 'Transfer Bank'}
                        </SelectItem>
                        <SelectItem value="credit">
                          {t('refundMethods.credit') || 'Store Credit'}
                        </SelectItem>
                        <SelectItem value="exchange">
                          {t('refundMethods.exchange') || 'Tukar Barang'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('notesLabel') || 'Catatan Tambahan'}</Label>
                  <Textarea
                    placeholder={
                      t('notesPlaceholder') || 'Keterangan lebih lanjut...'
                    }
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Link href="/pos/returns">
                    <Button variant="outline">
                      {t('cancelBtn') || 'Batal'}
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || returnItems.length === 0}
                  >
                    {isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {t('submitBtn') || 'Buat Retur'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ variant, children }: any) {
  const styles = {
    success: 'bg-success/20 text-success hover:bg-success/30',
    secondary: 'bg-muted text-muted-foreground hover:bg-muted/80',
    destructive: 'bg-destructive/20 text-destructive hover:bg-destructive/30',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${styles[variant as keyof typeof styles] || styles.secondary}`}
    >
      {children}
    </span>
  );
}
