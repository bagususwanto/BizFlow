'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useFormatDate } from '@/hooks';
import {
  useStockOpname,
  useUpdateStockOpnameItems,
  useFinalizeStockOpname,
  useCancelStockOpname,
  useDeleteStockOpname,
} from '@/hooks/use-stock-opnames';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@bizflow/ui';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { Save, CheckCircle, XCircle, Trash2, ArrowLeft } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import { toast } from 'sonner';

export default function StockOpnameDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const t = useTranslations('opname.detail');
  const tStatus = useTranslations('opname.status');
  const tDelete = useTranslations('opname.delete');
  const tCommon = useTranslations('common');
  const formatters = useFormatDate();

  const { data: opname, isLoading, isError } = useStockOpname(id);
  const updateItemsMutation = useUpdateStockOpnameItems();
  const finalizeMutation = useFinalizeStockOpname();
  const cancelMutation = useCancelStockOpname();
  const deleteMutation = useDeleteStockOpname();

  // Local state for counting
  const [countedItems, setCountedItems] = useState<
    Record<string, { qty: string; notes: string }>
  >({});

  // Dialogs state
  const [showFinalize, setShowFinalize] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // Dialog input states
  const [finalizeNotes, setFinalizeNotes] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');

  // Initialize local state when data loads
  useEffect(() => {
    if (opname?.items) {
      const initial: Record<string, { qty: string; notes: string }> = {};
      opname.items.forEach((item) => {
        initial[item.id] = {
          qty: item.countedQty !== null ? String(item.countedQty) : '',
          notes: item.notes || '',
        };
      });
      setCountedItems(initial);
    }
  }, [opname]);

  useBreadcrumb(`/inventory/opname/${id}`, opname?.opnameNumber || 'Details');

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (isError || !opname) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Error</h2>
          <p className="text-muted-foreground mb-4">
            {t('failedLoad') || 'Failed to load stock opname details'}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('buttons.back')}
          </Button>
        </div>
      </div>
    );
  }

  const isEditable = opname.status === 'in_progress';

  const handleItemCountChange = (itemId: string, value: string) => {
    // Only allow numbers
    if (value && !/^\d*\.?\d*$/.test(value)) return;

    setCountedItems((prev: Record<string, { qty: string; notes: string }>) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        qty: value,
        notes: prev[itemId]?.notes || '',
      },
    }));
  };

  const handleItemNoteChange = (itemId: string, value: string) => {
    setCountedItems((prev: Record<string, { qty: string; notes: string }>) => ({
      ...prev,
      [itemId]: { ...prev[itemId], notes: value, qty: prev[itemId]?.qty || '' },
    }));
  };

  const handleSaveCounts = () => {
    // Collect all changed items that have a valid quantity
    const itemsToUpdate = Object.entries(countedItems)
      .filter(([_, data]) => data.qty !== '')
      .map(([id, data]) => ({
        opnameItemId: id,
        countedQty: Number(data.qty),
        notes: data.notes || undefined,
      }));

    if (itemsToUpdate.length === 0) {
      toast.error(
        t('messages.itemsMin') || 'At least one item must be updated',
      );
      return;
    }

    updateItemsMutation.mutate(
      { id, data: { items: itemsToUpdate } },
      {
        onSuccess: () => {
          // Success handled in hook
        },
      },
    );
  };

  const handleFinalize = () => {
    finalizeMutation.mutate(
      { id, data: { notes: finalizeNotes || undefined } },
      {
        onSuccess: () => {
          setShowFinalize(false);
        },
      },
    );
  };

  const handleCancel = () => {
    cancelMutation.mutate(
      { id, data: { notes: cancelNotes || undefined } },
      {
        onSuccess: () => {
          setShowCancel(false);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        router.push('/inventory/opname');
      },
    });
  };

  const statusVariant =
    opname.status === 'in_progress'
      ? 'outline'
      : opname.status === 'finalized'
        ? 'default'
        : 'destructive';

  const badgeClass =
    opname.status === 'finalized' ? 'bg-success hover:bg-success/90' : '';

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              {opname.opnameNumber}
            </h2>
            <Badge variant={statusVariant} className={`text-sm ${badgeClass}`}>
              {tStatus(opname.status as any).toUpperCase()}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <>
              <Button
                variant="outline"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setShowCancel(true)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {t('buttons.cancel')}
              </Button>
              <Button
                variant="default"
                className="bg-success hover:bg-success/90 text-success-foreground"
                onClick={() => setShowFinalize(true)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('buttons.finalize')}
              </Button>
            </>
          )}

          {(opname.status === 'in_progress' ||
            opname.status === 'cancelled') && (
            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setShowDelete(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('infoTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('warehouse')}:</span>
              <span className="font-medium">{opname.warehouse?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('category')}:</span>
              <span className="font-medium">
                {opname.category?.name || '-'}
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <p className="font-medium">{t('notes')}:</p>
              <p className="mt-1 line-clamp-3">{opname.notes || '-'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('datesTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('date')}:</span>
              <span>{formatters.formatDate(opname.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('createdBy')}:</span>
              <span>{opname.creator?.name || '-'}</span>
            </div>

            {opname.status === 'finalized' && (
              <>
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground">
                    {t('finalizedBy')}:
                  </span>
                  <span>
                    {opname.finalizer?.name || opname.finalizedBy || '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('finalizedAt')}:
                  </span>
                  <span>{formatters.formatDate(opname.updatedAt)}</span>
                </div>
              </>
            )}

            {opname.status === 'cancelled' && (
              <>
                <div className="flex justify-between mt-2">
                  <span className="text-muted-foreground">
                    {t('cancelledBy')}:
                  </span>
                  <span>{opname.creator?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('cancelledAt')}:
                  </span>
                  <span>{formatters.formatDate(opname.updatedAt)}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('summary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center px-4 py-2 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground font-medium">
                {t('totalItems')}
              </span>
              <span className="text-2xl font-bold">
                {opname.items?.length || 0}
              </span>
            </div>
            {isEditable && (
              <Button
                className="w-full mt-2"
                onClick={handleSaveCounts}
                disabled={updateItemsMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {t('buttons.saveCount')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('itemsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('itemsTable.product')}</TableHead>
                  <TableHead>{t('itemsTable.sku')}</TableHead>
                  <TableHead className="text-right">
                    {t('itemsTable.systemQty')}
                  </TableHead>
                  <TableHead className="w-[150px] text-right">
                    {t('itemsTable.countedQty')}
                    {isEditable && (
                      <span className="text-destructive ml-1">*</span>
                    )}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('itemsTable.diffQty')}
                  </TableHead>
                  <TableHead className="w-[200px]">
                    {t('itemsTable.notes')}
                    {isEditable && (
                      <span className="text-muted-foreground font-normal ml-1 text-xs">
                        ({tCommon('optional') || 'Opsional'})
                      </span>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {opname.items?.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-24 text-muted-foreground"
                    >
                      No items to count
                    </TableCell>
                  </TableRow>
                )}
                {opname.items?.map((item) => {
                  const localState = countedItems[item.id] || {
                    qty: '',
                    notes: '',
                  };
                  const systemQty = Number(item.systemQty);

                  // Calculate diff based on active input, or fallback to saved difference
                  let diffQty: number | null = null;
                  if (localState.qty !== '') {
                    const parsed = Number(localState.qty);
                    if (!isNaN(parsed)) {
                      diffQty = parsed - systemQty;
                    }
                  } else if (item.differenceQty !== null) {
                    diffQty = Number(item.differenceQty);
                  }

                  const diffColorClass =
                    diffQty === null || isNaN(diffQty)
                      ? 'text-muted-foreground'
                      : diffQty > 0
                        ? 'text-success'
                        : diffQty < 0
                          ? 'text-destructive'
                          : '';

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.variant?.product?.name || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.variant?.sku || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {systemQty}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditable ? (
                          <Input
                            type="text"
                            inputMode="decimal"
                            className="h-8 w-24 ml-auto text-right"
                            value={localState.qty}
                            onChange={(e) =>
                              handleItemCountChange(item.id, e.target.value)
                            }
                            placeholder="-"
                          />
                        ) : (
                          <span className="font-bold">
                            {item.countedQty !== null ? item.countedQty : '-'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${diffColorClass}`}
                      >
                        {diffQty !== null && !isNaN(diffQty)
                          ? diffQty > 0
                            ? `+${diffQty}`
                            : String(diffQty)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {isEditable ? (
                          <Input
                            type="text"
                            className="h-8"
                            value={localState.notes}
                            onChange={(e) =>
                              handleItemNoteChange(item.id, e.target.value)
                            }
                            placeholder="Add note..."
                          />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {item.notes || '-'}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AlertDialog open={showFinalize} onOpenChange={setShowFinalize}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.finalize.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.finalize.desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-1 block">
              {t('dialogs.finalize.notes')}{' '}
              <span className="text-muted-foreground font-normal text-xs">
                ({tCommon('optional') || 'Opsional'})
              </span>
            </label>
            <Textarea
              value={finalizeNotes}
              onChange={(e) => setFinalizeNotes(e.target.value)}
              placeholder="..."
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <Button
              onClick={handleFinalize}
              disabled={finalizeMutation.isPending}
            >
              {t('dialogs.finalize.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCancel} onOpenChange={setShowCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dialogs.cancel.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('dialogs.cancel.desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-1 block">
              {t('dialogs.cancel.notes')}{' '}
              <span className="text-muted-foreground font-normal text-xs">
                ({tCommon('optional') || 'Opsional'})
              </span>
            </label>
            <Textarea
              value={cancelNotes}
              onChange={(e) => setCancelNotes(e.target.value)}
              placeholder="..."
              className="resize-none"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {t('dialogs.cancel.confirm')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title={tDelete('title')}
        description={
          <>
            {tDelete('desc1')}
            <strong>{opname.opnameNumber}</strong>
            {tDelete('desc2')}
          </>
        }
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
