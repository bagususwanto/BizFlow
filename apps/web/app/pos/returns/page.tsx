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
import { useReturns } from '@/hooks/use-returns';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, Plus, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function PosReturnsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useReturns({
    page,
    pageSize,
    search: search || undefined,
    status: status === 'all' ? undefined : (status as any),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const returns = data?.data || [];
  const meta = data?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Approval';
      case 'approved':
        return 'Disetujui';
      case 'rejected':
        return 'Ditolak';
      case 'completed':
        return 'Selesai';
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
              Retur Penjualan
            </h1>
            <p className="text-muted-foreground">
              Kelola retur dan pengembalian barang dari pelanggan.
            </p>
          </div>
          <Link href="/pos/returns/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Retur Baru
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Daftar Retur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                <div className="relative w-full md:w-[300px]">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari No. Retur atau Order..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={status}
                  onValueChange={(val) => {
                    setStatus(val);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-full md:w-[200px]">
                    <div className="flex items-center">
                      <span className="mr-2 hidden lg:inline-block">
                        Status:
                      </span>
                      <SelectValue placeholder="Pilih Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="pending">Menunggu Approval</SelectItem>
                    <SelectItem value="approved">Disetujui</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                  </SelectContent>
                </Select>

                {(search || status !== 'all') && (
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
                    <TableHead>No. Retur</TableHead>
                    <TableHead>No. Order</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Refund</TableHead>
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
                  ) : returns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada data retur.
                      </TableCell>
                    </TableRow>
                  ) : (
                    returns.map((ret: any) => (
                      <TableRow key={ret.id}>
                        <TableCell className="font-medium">
                          {ret.returnNumber}
                        </TableCell>
                        <TableCell>{ret.order?.orderNumber || '-'}</TableCell>
                        <TableCell>
                          {format(
                            new Date(ret.createdAt),
                            'dd MMM yyyy HH:mm',
                            {
                              locale: idLocale,
                            },
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(ret.status) as any}>
                            {getStatusLabel(ret.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(ret.refundAmount || 0))}
                        </TableCell>
                        <TableCell>
                          <Link href={`/pos/returns/${ret.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
