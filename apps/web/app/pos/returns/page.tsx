'use client';

import { useState, useMemo } from 'react';
import { PosHeader } from '@/components/pos/pos-header';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns, ReturnItem } from '@/components/pos/returns/columns';
import { useReturns } from '@/hooks/use-returns';
import { useFormatDate } from '@/hooks';

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

  const returns = (data?.data || []) as ReturnItem[];
  const meta = data?.meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  const formatters = useFormatDate();
  const columns = useMemo(() => getColumns(formatters), [formatters]);

  const handleReset = () => {
    setSearch('');
    setStatus('all');
    setPage(1);
  };

  return (
    <div className="flex flex-col h-screen bg-muted/10">
      <PosHeader onHelpClick={() => {}} backHref="/pos" backLabel="POS" />

      <div className="flex-1 p-6 overflow-auto">
        <DataListPage
          title="Retur Penjualan"
          description="Kelola retur dan pengembalian barang dari pelanggan."
          createLink="/pos/returns/create"
          createLabel="Buat Retur Baru"
          data={returns}
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
          searchPlaceholder="Cari No. Retur atau Order..."
          // Filters
          filters={[
            {
              key: 'status',
              label: 'Status',
              options: [
                { label: 'Menunggu Approval', value: 'pending' },
                { label: 'Disetujui', value: 'approved' },
                { label: 'Ditolak', value: 'rejected' },
                { label: 'Selesai', value: 'completed' },
              ],
              width: 'w-full md:w-[200px]',
            },
          ]}
          filterValues={{ status }}
          onFilterChange={(key, value) => {
            if (key === 'status') setStatus(value);
            setPage(1);
          }}
          onReset={handleReset}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
