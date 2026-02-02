'use client';

import { PosHeader } from '@/components/pos/pos-header';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@bizflow/ui';
import { usePosTransactions } from '@/hooks/use-pos';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function PosTransactionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all'); // Filter by payment status or order status if available
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePosTransactions({
    page,
    pageSize,
    search: search || undefined,
    // Add status filter if backend supports it. Assuming generic filter for now.
    // status: status === 'all' ? undefined : status,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    enabled: true, // Enable fetch
  });

  const transactions = data?.data?.data || [];
  const meta = data?.data?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      case 'partially_paid':
        return 'default'; // or special color
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Lunas';
      case 'pending':
        return 'Belum Lunas';
      case 'cancelled':
        return 'Dibatalkan';
      case 'partially_paid':
        return 'Cicilan';
      default:
        return status;
    }
  };

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="flex flex-col h-screen bg-muted/10">
      <PosHeader onHelpClick={() => {}} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Riwayat Transaksi
            </h1>
            <p className="text-muted-foreground">
              Lihat dan kelola riwayat transaksi penjualan POS.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari No. Order..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
                {/* Status Filter (Optional - kept simple for now) */}
                {/* 
                  <Select
                     value={status}
                     onValueChange={(val) => { setStatus(val); setPage(1); }}
                  >
                     <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Semua Status" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        <SelectItem value="paid">Lunas</SelectItem>
                        <SelectItem value="pending">Belum Lunas</SelectItem>
                        <SelectItem value="cancelled">Dibatalkan</SelectItem>
                     </SelectContent>
                  </Select>
                  */}

                {search && (
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="h-8 px-2 lg:px-3"
                  >
                    Reset
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Order</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada riwayat transaksi.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((trx: any) => (
                      <TableRow key={trx.id}>
                        <TableCell className="font-medium">
                          {trx.orderNumber}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(trx.createdAt),
                            'dd MMM yyyy HH:mm',
                            {
                              locale: idLocale,
                            },
                          )}
                        </TableCell>
                        <TableCell>{trx.customer?.name || 'Umum'}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(trx.status) as any}>
                            {getStatusLabel(trx.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(trx.grandTotal || 0))}
                        </TableCell>
                        {/* Detail Link (Pending /pos/transactions/[id]) */}
                        <TableCell>
                          {/* 
                          <Link href={`/pos/transactions/${trx.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          */}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Total:{' '}
                  <span className="font-medium text-foreground">
                    {meta.totalItems}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-muted-foreground hidden sm:block">
                    Baris per halaman
                  </p>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(val) => {
                      setPageSize(Number(val));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={pageSize.toString()} />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[5, 10, 20, 50].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        className={
                          page <= 1 ? 'pointer-events-none opacity-50' : ''
                        }
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <span className="flex h-9 items-center justify-center px-4 text-sm">
                        Halaman {page} dari {meta.totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < meta.totalPages) setPage(page + 1);
                        }}
                        className={
                          page >= meta.totalPages
                            ? 'pointer-events-none opacity-50'
                            : ''
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
