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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@bizflow/ui';
import { formatCurrency } from '@/lib/utils';
import { MoreHorizontal, Pencil, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { PriceLevelForm } from './price-level-form';
import {
  usePriceLevels,
  useCreatePriceLevel,
  useUpdatePriceLevel,
  useDeletePriceLevel,
} from '@/hooks/use-products';
import { useTranslations } from 'next-intl';

import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';

interface PriceLevelListProps {
  productId: string;
}

export function PriceLevelList({ productId }: PriceLevelListProps) {
  const t = useTranslations('products.priceLevels');
  const { data: priceLevels, isLoading } = usePriceLevels(productId);
  const createMutation = useCreatePriceLevel(productId);
  const updateMutation = useUpdatePriceLevel(productId);
  const deleteMutation = useDeletePriceLevel(productId);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleCreate = async (data: any) => {
    await createMutation.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdate = async (data: any) => {
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, values: data });
      setIsFormOpen(false);
      setEditingId(null);
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setIsFormOpen(true);
  };

  const openEdit = (priceLevel: any) => {
    setEditingId(priceLevel.id);
    setIsFormOpen(true);
  };

  if (isLoading) {
    return <div className="p-4 text-center">{t('loading')}</div>;
  }

  const editingPriceLevel = priceLevels?.find((pl) => pl.id === editingId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('description')}</CardDescription>
        </div>
        <Button type="button" onClick={openCreate} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          {t('addLevel')}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('columns.name')}</TableHead>
                <TableHead className="text-center">
                  {t('columns.minQty')}
                </TableHead>
                <TableHead className="text-right">
                  {t('columns.price')}
                </TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceLevels?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {t('empty')}
                  </TableCell>
                </TableRow>
              ) : (
                priceLevels?.map((priceLevel) => (
                  <TableRow key={priceLevel.id}>
                    <TableCell className="font-medium">
                      {priceLevel.name}
                    </TableCell>
                    <TableCell className="text-center">
                      {priceLevel.minQty}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(priceLevel.price))}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            type="button"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEdit(priceLevel)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('form.editTitle').includes('Edit')
                              ? 'Edit'
                              : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleteId(priceLevel.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('deleteDialog.title').includes('Hapus')
                              ? 'Hapus'
                              : 'Delete'}
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

        <PriceLevelForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={editingId ? handleUpdate : handleCreate}
          initialData={editingPriceLevel}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />

        <DeleteConfirmDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          title={t('deleteDialog.title')}
          description={
            <>
              <p>{t('deleteDialog.desc')}</p>
              <p className="mt-2 text-sm text-warning">
                {t('deleteDialog.warning')}
              </p>
            </>
          }
          onConfirm={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
