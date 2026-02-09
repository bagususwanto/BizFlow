'use client';

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import {
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { useStocks } from '@/hooks/use-stock';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useActiveCategories } from '@/hooks/use-categories';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { useDebounce } from '@/hooks/use-debounce';

export default function StockPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [warehouseId, setWarehouseId] = useState<string>('all');
  const [categoryId, setCategoryId] = useState<string>('all');

  const debouncedSearch = useDebounce(search, 500);

  const { warehouses } = useWarehouses({ isActive: true });
  const { data: categories } = useActiveCategories();

  const { data, isLoading, refetch } = useStocks({
    page,
    pageSize,
    search: debouncedSearch,
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    categoryId: categoryId !== 'all' ? categoryId : undefined,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    hasStock: true, // Only show items with stock? Maybe optional. Let's keep default behavior.
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page on search
  };

  const handleWarehouseChange = (value: string) => {
    setWarehouseId(value);
    setPage(1);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setPage(1);
  };

  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="flex flex-1 flex-col space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Stok Overview</h1>
        <p className="text-muted-foreground">
          Monitor stok barang di semua gudang
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Item Stok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.summary?.totalStockRecords || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Record stok di database
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Varian Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.summary?.totalVariantsWithStock || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Varian yang memiliki data stok
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gudang</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.summary?.totalWarehouses || 0}
            </div>
            <p className="text-xs text-muted-foreground">Gudang aktif</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-lg border">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau SKU..."
              className="pl-8"
              value={search}
              onChange={handleSearch}
            />
          </div>

          <Select value={warehouseId} onValueChange={handleWarehouseChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Gudang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Gudang</SelectItem>
              {warehouses?.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryId} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Pilih Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm font-medium">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || isLoading}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
