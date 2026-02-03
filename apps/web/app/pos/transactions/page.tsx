'use client';

import { useState, useMemo } from 'react';
import { PosHeader } from '@/components/pos/pos-header';
import { DataListPage } from '@/components/shared/data-list-page';
import {
  getColumns,
  TransactionItem,
} from '@/components/pos/transactions/columns';
import { usePosTransactions } from '@/hooks/use-pos';

export default function PosTransactionsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePosTransactions({
    page,
    pageSize,
    search: search || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    enabled: true,
  });

  const transactions = (data?.data?.data || []) as TransactionItem[];
  const meta = data?.data?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  const columns = useMemo(() => getColumns(), []);

  const handleReset = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <div className="flex flex-col h-screen bg-muted/10">
      <PosHeader onHelpClick={() => {}} />

      <div className="flex-1 p-6 overflow-auto">
        <DataListPage
          title="Riwayat Transaksi"
          description="Lihat dan kelola riwayat transaksi penjualan POS."
          data={transactions}
          columns={columns}
          isLoading={isLoading}
          getRowId={(row) => row.id}
          // Pagination
          page={page}
          pageSize={pageSize}
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          // Search
          search={search}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          searchPlaceholder="Cari No. Order..."
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
