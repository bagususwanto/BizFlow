'use client';

import { ChevronDown, Search, Settings2, X } from 'lucide-react';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { useActiveCategories } from '@/hooks/use-categories';

interface ProductsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryId: string;
  onCategoryFilterChange: (value: string) => void;
  status: string;
  onStatusFilterChange: (value: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (value: Record<string, boolean>) => void;
  onReset: () => void;
}

export function ProductsToolbar({
  search,
  onSearchChange,
  categoryId,
  onCategoryFilterChange,
  status,
  onStatusFilterChange,
  columnVisibility,
  onColumnVisibilityChange,
  onReset,
}: ProductsToolbarProps) {
  const { data: categories = [] } = useActiveCategories();

  const isFiltered = search !== '' || categoryId !== 'all' || status !== 'all';

  const columns = [
    { id: 'sku', label: 'SKU' },
    { id: 'barcode', label: 'Barcode' },
    { id: 'name', label: 'Nama Produk' },
    { id: 'category', label: 'Kategori' },
    { id: 'unit', label: 'Satuan' },
    { id: 'sellPrice', label: 'Harga Jual' },
    { id: 'minStock', label: 'Min. Stok' },
    { id: 'isActive', label: 'Status' },
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk (Nama, SKU, Barcode)..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={categoryId} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <div className="flex items-center">
              <span className="mr-2 hidden lg:inline-block">Kategori:</span>
              <SelectValue placeholder="Semua Kategori" />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            <SelectItem value="all">Semua Kategori</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full md:w-[150px]">
            <div className="flex items-center">
              <span className="mr-2 hidden lg:inline-block">Status:</span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                Kolom
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={columnVisibility[column.id] !== false}
                    onCheckedChange={(value) =>
                      onColumnVisibilityChange({
                        ...columnVisibility,
                        [column.id]: !!value,
                      })
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
