import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { DataTable } from '@/components/ui/data-table';
import { getColumns } from '../columns';
import { LotsTableProps } from '../types';
import { useFormatDate } from '@/hooks';

export function LotsTable({
  data,
  isLoading,
  query,
  meta,
  onPageChange,
  onPageSizeChange,
  onSortChange,
}: LotsTableProps) {
  const t = useTranslations('inventory.lots');
  const formatters = useFormatDate();
  
  const columns = useMemo(() => getColumns(formatters, t as any), [formatters, t]);

  return (
    <DataTable
      columns={columns as any[]}
      data={data as any[]}
      isLoading={isLoading}
      // DataTable handles these differently or not at all depending on the exact Bizflow UI implementation
      // Just map sorting up to DataTable if supported, otherwise skip unknown props
      sorting={query.sortBy ? [{ id: query.sortBy, desc: query.sortOrder === 'desc' }] : []}
      onSortingChange={(updater) => {
        if (typeof updater === 'function') {
          const newSort = updater([{ id: query.sortBy || '', desc: query.sortOrder === 'desc' }]);
          if (newSort[0]) {
            onSortChange(newSort[0].id, newSort[0].desc ? 'desc' : 'asc');
          }
        }
      }}
    />
  );
}
