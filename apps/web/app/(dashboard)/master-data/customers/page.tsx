'use client';

import { Suspense, useCallback, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useCustomers } from '@/hooks/use-customers';
import { CustomersQuery } from '@/services/customers.service';
import { Customer } from '@bizflow/types';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/master-data/customers/columns';
import { ErrorState } from '@/components/common/error-state';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { toast } from 'sonner';

function CustomersContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;
  const status = searchParams.get('status') || 'all';

  const queryParams: CustomersQuery = {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    isActive: status === 'all' ? undefined : status === 'active',
  };

  const {
    customers,
    meta,
    summary,
    isLoading,
    isError,
    deleteCustomer,
    isDeleting,
    bulkDeleteCustomers,
    isBulkDeleting,
    refetch,
  } = useCustomers(queryParams);

  // Delete Dialog State
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null,
  );

  const handleCreateQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(params)) {
        if (value === null || value === '' || value === 'all') {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      }

      return newSearchParams.toString();
    },
    [searchParams],
  );

  const updateUrl = (params: Record<string, string | number | null>) => {
    const queryString = handleCreateQueryString(params);
    router.push(`${pathname}?${queryString}`);
  };

  const handleError = () => (
    <ErrorState title="Gagal memuat data pelanggan" onRetry={() => refetch()} />
  );

  const handleBulkDelete = (ids: string[]) => {
    bulkDeleteCustomers(ids, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onDelete: (customer) => setCustomerToDelete(customer),
      }),
    [],
  );

  const data = customers || [];
  const metaData = meta || {
    totalPages: 1,
    totalItems: 0,
    page: 1,
    pageSize: 10,
  };

  return (
    <>
      <DataListPage
        title="Pelanggan"
        description="Manajemen data pelanggan dan credit limit."
        createLink="/master-data/customers/create"
        createLabel="Tambah Pelanggan"
        data={data}
        columns={columns}
        isLoading={isLoading}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalPages={metaData.totalPages}
        totalItems={metaData.totalItems}
        onPageChange={(p) => updateUrl({ page: p })}
        onPageSizeChange={(s) => updateUrl({ pageSize: s, page: 1 })}
        summary={
          summary
            ? {
                total: summary.totalCustomers,
                active: summary.activeCustomers,
                inactive: summary.inactiveCustomers,
              }
            : undefined
        }
        // Sorting
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={(field) => {
          if (sortBy === field) {
            updateUrl({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
          } else {
            updateUrl({ sortBy: field, sortOrder: 'asc' });
          }
        }}
        // Search
        search={search}
        onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
        searchPlaceholder="Cari pelanggan..."
        // Filters
        filterValues={{ status }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => router.push(pathname)}
        filters={[
          {
            key: 'status',
            label: 'Status',
            options: [
              { label: 'Aktif', value: 'active' },
              { label: 'Non-aktif', value: 'inactive' },
            ],
            width: 'w-[150px]',
          },
        ]}
        // Actions
        onBulkDelete={handleBulkDelete}
        isBulkDeleting={isBulkDeleting}
        onRefresh={refetch}
        isError={isError}
      />

      {/* Single Delete Dialog */}
      <DeleteConfirmDialog
        open={!!customerToDelete}
        onOpenChange={(open) => !open && setCustomerToDelete(null)}
        title={
          customerToDelete?.isActive
            ? 'Nonaktifkan Pelanggan?'
            : 'Hapus Pelanggan Permanen?'
        }
        description={
          customerToDelete?.isActive ? (
            <>
              Pelanggan{' '}
              <span className="font-medium text-foreground">
                {customerToDelete?.name}
              </span>{' '}
              akan dinonaktifkan. Data pelanggan tetap tersimpan.
            </>
          ) : (
            <>
              <p>
                Pelanggan{' '}
                <span className="font-medium text-foreground">
                  {customerToDelete?.name}
                </span>{' '}
                akan dihapus secara permanen. Tindakan ini tidak dapat
                dibatalkan.
              </p>
              <p className="mt-2 text-sm text-warning">
                Peringatan: Jika pelanggan masih memiliki riwayat transaksi
                (penjualan, pembayaran, dll), sistem akan menolak penghapusan
                permanen.
              </p>
            </>
          )
        }
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete.id, {
              onSuccess: () => setCustomerToDelete(null),
            });
          }
        }}
        isDeleting={isDeleting}
        confirmLabel={
          customerToDelete?.isActive ? 'Nonaktifkan' : 'Hapus Permanen'
        }
        cancelLabel="Batal"
      />
    </>
  );
}

export default function CustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CustomersContent />
    </Suspense>
  );
}
