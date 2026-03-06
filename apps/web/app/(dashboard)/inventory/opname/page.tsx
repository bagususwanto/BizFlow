'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { DataListPage } from '@/components/shared/data-list-page';
import { getColumns } from '@/components/inventory/opname/columns';
import { useFormatDate } from '@/hooks';
import {
  useStockOpnames,
  useDeleteStockOpname,
  useBulkDeleteStockOpnames,
} from '@/hooks/use-stock-opnames';
import { StockOpname } from '@bizflow/types';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useRouter, usePathname } from 'next/navigation';

export default function StockOpnamePage() {
  const t = useTranslations();
  const formatters = useFormatDate();

  const router = useRouter();
  const pathname = usePathname();

  // State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const [deleteOpname, setDeleteOpname] = useState<StockOpname | null>(null);

  const { warehouses = [] } = useWarehouses({ pageSize: 100 });

  const updateUrl = (newParams: any) => {
    if (newParams.page !== undefined) setPage(newParams.page);
    if (newParams.pageSize !== undefined) setPageSize(newParams.pageSize);
    if (newParams.search !== undefined) setSearchQuery(newParams.search);
    if (newParams.status !== undefined) setStatusFilter(newParams.status);
    if (newParams.warehouseId !== undefined)
      setWarehouseFilter(newParams.warehouseId);
    if (newParams.startDate !== undefined) setStartDate(newParams.startDate);
    if (newParams.endDate !== undefined) setEndDate(newParams.endDate);
  };

  const queryParams = {
    page,
    pageSize,
    search: searchQuery || undefined,
    status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
    warehouseId: warehouseFilter !== 'all' ? warehouseFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data, isLoading, refetch } = useStockOpnames(queryParams);
  const deleteMutation = useDeleteStockOpname();
  const bulkDeleteMutation = useBulkDeleteStockOpnames();

  // Dialog Handlers
  const handleDeleteConfirm = () => {
    if (deleteOpname) {
      deleteMutation.mutate(deleteOpname.id, {
        onSuccess: () => {
          setDeleteOpname(null);
        },
      });
    }
  };

  const handleBulkDelete = (selectedRows: any[]) => {
    const ids = selectedRows.map((row) => row.id);
    bulkDeleteMutation.mutate(ids, {
      onSuccess: () => {
        // success handlings is automatically done in mutate options inside hook
      },
    });
  };

  const summary = data?.summary || {
    total: 0,
    in_progress: 0,
    finalized: 0,
    cancelled: 0,
  };

  const summaryCards = [
    {
      title: t('opname.summary.total.title'),
      value: summary.total,
      description: t('opname.summary.total.desc'),
    },
    {
      title: t('opname.summary.inProgress.title'),
      value: summary.in_progress,
      description: t('opname.summary.inProgress.desc'),
    },
    {
      title: t('opname.summary.finalized.title'),
      value: summary.finalized,
      description: t('opname.summary.finalized.desc'),
      valueClass: 'text-success',
    },
    {
      title: t('opname.summary.cancelled.title'),
      value: summary.cancelled,
      description: t('opname.summary.cancelled.desc'),
      valueClass: 'text-destructive',
    },
  ];

  const columns = getColumns({
    onDelete: setDeleteOpname,
    formatters,
    t: (key: string) => t(`opname.${key}`),
  });

  return (
    <>
      <DataListPage
        title={t('opname.title')}
        description={t('opname.description')}
        createLink="/inventory/opname/new"
        createLabel={t('opname.createLabel')}
        data={data?.data || []}
        columns={columns}
        isLoading={isLoading}
        // Pagination
        page={page}
        pageSize={pageSize}
        totalPages={data?.meta.totalPages || 0}
        totalItems={data?.meta.totalItems || 0}
        onPageChange={(p) => updateUrl({ page: p })}
        onPageSizeChange={(s) => updateUrl({ pageSize: s, page: 1 })}
        // Search & Filters
        search={searchQuery}
        onSearchChange={(v) => updateUrl({ search: v, page: 1 })}
        searchPlaceholder={t('opname.searchPlaceholder')}
        filterValues={{
          status: statusFilter,
          warehouseId: warehouseFilter || 'all',
        }}
        onFilterChange={(key, value) => updateUrl({ [key]: value, page: 1 })}
        onReset={() => {
          setPage(1);
          setSearchQuery('');
          setStatusFilter('all');
          setWarehouseFilter('all');
          setStartDate(null);
          setEndDate(null);
        }}
        showDateRange={true}
        startDate={startDate ? new Date(startDate) : undefined}
        endDate={endDate ? new Date(endDate) : undefined}
        onDateRangeChange={(start, end) =>
          updateUrl({
            startDate: start?.toISOString() || null,
            endDate: end?.toISOString() || null,
            page: 1,
          })
        }
        filters={[
          {
            key: 'status',
            label: t('opname.filters.status.label'),
            options: [
              {
                label: t('opname.filters.status.in_progress'),
                value: 'in_progress',
              },
              {
                label: t('opname.filters.status.finalized'),
                value: 'finalized',
              },
              {
                label: t('opname.filters.status.cancelled'),
                value: 'cancelled',
              },
            ],
          },
          {
            key: 'warehouseId',
            label: t('opname.filters.warehouse.label'),
            type: 'combobox',
            options: warehouses.map((warehouse: any) => ({
              label: warehouse.name,
              value: warehouse.id,
            })),
            width: 'w-full md:w-[200px]',
            searchPlaceholder: t('opname.filters.warehouse.searchPlaceholder'),
          },
        ]}
      />

      <DeleteConfirmDialog
        open={!!deleteOpname}
        onOpenChange={(open) => !open && setDeleteOpname(null)}
        title={t('opname.delete.title')}
        description={
          <>
            {t('opname.delete.desc1')}
            <strong>{deleteOpname?.opnameNumber}</strong>
            {t('opname.delete.desc2')}
          </>
        }
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </>
  );
}
