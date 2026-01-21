'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Badge,
} from '@bizflow/ui';
import { useState, useMemo } from 'react';
import {
  SortingState,
  OnChangeFn,
  RowSelectionState,
  ColumnDef,
} from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
  ProductWithRelations,
  productsService,
} from '@/services/products.service';
import { DataTable } from '@/components/ui/data-table';
import { formatCurrency } from '@/lib/utils';

interface ProductsTableProps {
  data: ProductWithRelations[];
  isLoading: boolean;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  onRefresh: () => void;
}

export function ProductsTable({
  data,
  isLoading,
  columnVisibility,
  onColumnVisibilityChange,
  onDelete,
  isDeleting = false,
  sortBy,
  sortOrder,
  onSortChange,
  onRefresh,
}: ProductsTableProps) {
  const [productToDelete, setProductToDelete] =
    useState<ProductWithRelations | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  const columns = useMemo<ColumnDef<ProductWithRelations>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'imageUrl',
        header: 'Gambar',
        cell: ({ row }) => {
          const imageUrl = row.getValue('imageUrl') as string;
          return (
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt={row.getValue('name')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center text-center justify-center bg-secondary text-muted-foreground">
                  <span className="text-xs">No img</span>
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'sku',
        header: 'SKU',
        cell: ({ row }) => (
          <span className="font-mono font-medium">{row.getValue('sku')}</span>
        ),
      },
      {
        accessorKey: 'barcode',
        header: 'Barcode',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {row.getValue('barcode') || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Nama Produk',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.getValue('name')}</span>
            {row.original.isService && (
              <span className="text-xs text-muted-foreground">(Jasa)</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ row }) => {
          const category = row.original.category;
          return category ? category.name : '-';
        },
        enableSorting: false,
      },
      {
        accessorKey: 'unit',
        header: 'Satuan',
        cell: ({ row }) => {
          const unit = row.original.unit;
          return unit ? unit.symbol : '-';
        },
        enableSorting: false,
      },
      {
        accessorKey: 'sellPrice',
        header: 'Harga Jual',
        cell: ({ row }) => {
          const price = Number(row.getValue('sellPrice'));
          return <div className="font-medium">{formatCurrency(price)}</div>;
        },
      },
      {
        accessorKey: 'minStock',
        header: 'Min. Stok',
        cell: ({ row }) => {
          if (row.original.isService)
            return <span className="text-muted-foreground">-</span>;

          const minStock = Number(row.getValue('minStock'));
          return (
            <div
              className={
                minStock > 0
                  ? 'font-medium text-amber-600'
                  : 'text-muted-foreground'
              }
            >
              {minStock}
            </div>
          );
        },
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => {
          const isActive = row.getValue('isActive') as boolean;
          return (
            <Badge
              variant={isActive ? 'default' : 'secondary'}
              className={isActive ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => {
          const product = row.original;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/master-data/products/${product.id}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setProductToDelete(product)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {product.isActive ? 'Nonaktifkan' : 'Hapus'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === 'desc' }],
    [sortBy, sortOrder],
  );

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      const ids = Object.keys(rowSelection);
      await productsService.bulkDelete(ids);
      toast.success(`${ids.length} produk berhasil dinonaktifkan`);
      setRowSelection({});
      setShowBulkDeleteDialog(false);
      onRefresh();
    } catch (error: any) {
      toast.error(
        error instanceof Error ? error.message : 'Gagal menghapus produk',
      );
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 rounded-md bg-muted px-4 py-2">
          <span className="text-sm font-medium">
            {selectedCount} item dipilih
          </span>
          <Button
            variant="destructive"
            size="sm"
            className="ml-auto h-8"
            onClick={() => setShowBulkDeleteDialog(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Terpilih
          </Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={(updaterOrValue) => {
          const newSorting =
            typeof updaterOrValue === 'function'
              ? updaterOrValue(sorting)
              : updaterOrValue;

          const firstSort = newSorting[0];
          if (firstSort) {
            onSortChange(firstSort.id);
          }
        }}
        columnVisibility={columnVisibility}
        onColumnVisibilityChange={onColumnVisibilityChange}
        enableRowSelection={true}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        getRowId={(row) => row.id}
      />

      {/* Delete Dialog */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(open) => !open && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {productToDelete?.isActive ? 'Nonaktifkan' : 'Hapus'} Produk?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Produk{' '}
              <span className="font-medium text-foreground">
                {productToDelete?.name}
              </span>{' '}
              akan {productToDelete?.isActive ? 'dinonaktifkan' : 'dihapus'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80"
              onClick={(e) => {
                e.preventDefault();
                if (productToDelete) {
                  onDelete(productToDelete.id);
                  setProductToDelete(null);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting
                ? 'Memproses...'
                : productToDelete?.isActive
                  ? 'Nonaktifkan'
                  : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={(open) => !open && setShowBulkDeleteDialog(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {selectedCount} Produk?</AlertDialogTitle>
            <AlertDialogDescription>
              Produk yang dipilih akan dinonaktifkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/80"
              onClick={(e) => {
                e.preventDefault();
                handleBulkDelete();
              }}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Memproses...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
