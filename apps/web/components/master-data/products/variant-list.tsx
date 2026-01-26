import { useState } from 'react';
import { ProductVariant, CreateVariantValues } from '@bizflow/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Checkbox,
} from '@bizflow/ui';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import { VariantForm } from './variant-form';
import {
  useProductVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
} from '@/hooks/use-products';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { formatCurrency } from '@/lib/utils'; // Assuming this exists, if not use Intl

interface VariantListProps {
  productId: string;
}

export function VariantList({ productId }: VariantListProps) {
  const { data: variants, isLoading } = useProductVariants(productId);
  const createVariant = useCreateVariant(productId);
  const updateVariant = useUpdateVariant(productId);
  const deleteVariant = useDeleteVariant(productId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<
    ProductVariant | undefined
  >(undefined);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = (data: CreateVariantValues) => {
    createVariant.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
    });
  };

  const handleUpdate = (data: CreateVariantValues) => {
    if (!editingVariant) return;
    updateVariant.mutate(
      { id: editingVariant.id, values: data },
      {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingVariant(undefined);
        },
      },
    );
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteVariant.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const formatAttributes = (attributesStr: string) => {
    try {
      const attrs = JSON.parse(attributesStr);
      return Object.entries(attrs)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch (e) {
      return attributesStr;
    }
  };

  if (isLoading) {
    return <div>Loading variants...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Daftar Varian</h3>
        <Button
          type="button"
          onClick={() => {
            setEditingVariant(undefined);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Varian
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Atribut</TableHead>
              <TableHead>Harga Beli</TableHead>
              <TableHead>Harga Jual</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {variants?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Belum ada varian produk.
                </TableCell>
              </TableRow>
            ) : (
              variants?.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell className="font-medium">{variant.sku}</TableCell>
                  <TableCell>{variant.name}</TableCell>
                  <TableCell>
                    {formatAttributes(variant.attributes as string)}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(Number(variant.costPrice))}
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                    }).format(Number(variant.sellPrice))}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          type="button"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(variant)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(variant.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <VariantForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingVariant(undefined);
        }}
        onSubmit={editingVariant ? handleUpdate : handleCreate}
        initialData={
          editingVariant
            ? {
                ...editingVariant,
                costPrice: Number(editingVariant.costPrice),
                sellPrice: Number(editingVariant.sellPrice),
                attributes: JSON.parse(editingVariant.attributes as string),
              }
            : undefined
        }
        isSubmitting={createVariant.isPending || updateVariant.isPending}
        productId={productId}
      />

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Apakah anda yakin?"
        description="Tindakan ini tidak dapat dibatalkan. Varian ini akan dinonaktifkan."
        onConfirm={handleDelete}
      />
    </div>
  );
}
