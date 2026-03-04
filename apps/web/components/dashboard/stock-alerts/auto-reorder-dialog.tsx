'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@bizflow/ui';
import { Badge, Button } from '@bizflow/ui';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@bizflow/ui';
import { useEffect } from 'react';
import {
  usePreviewAutoReorder,
  useExecuteAutoReorder,
} from '@/hooks/use-purchase-orders';
import { useTranslations } from 'next-intl';

interface AutoReorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantIds: string[];
  onSuccess?: () => void;
}

export function AutoReorderDialog({
  open,
  onOpenChange,
  variantIds,
  onSuccess,
}: AutoReorderDialogProps) {
  const t = useTranslations('dashboard');
  const previewMutation = usePreviewAutoReorder();
  const executeMutation = useExecuteAutoReorder();

  // Fetch preview whenever dialog opens with new variantIds
  useEffect(() => {
    if (open && variantIds.length > 0) {
      previewMutation.mutate(variantIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, variantIds.join(',')]);

  const preview = previewMutation.data;

  const handleExecute = async () => {
    executeMutation.mutate(variantIds, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('stockAlertsPage.autoReorder.title')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('stockAlertsPage.autoReorder.description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Loading preview */}
        {previewMutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">
              {t('stockAlertsPage.autoReorder.analyzing')}
            </span>
          </div>
        )}

        {/* Preview result */}
        {preview && (
          <div className="space-y-4">
            {preview.groups.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {preview.groups.length}{' '}
                  {t('stockAlertsPage.autoReorder.willCreate')}
                </p>
                {preview.groups.map((group) => {
                  const subtotal = group.items.reduce(
                    (sum, item) => sum + item.orderQty * item.unitPrice,
                    0,
                  );
                  return (
                    <div
                      key={group.supplierId}
                      className="rounded-md border p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">
                          {group.supplierName}{' '}
                          <span className="text-muted-foreground font-normal">
                            ({group.supplierCode})
                          </span>
                        </p>
                        <Badge variant="outline">
                          {group.items.length}{' '}
                          {t('stockAlertsPage.autoReorder.items')}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <div
                            key={item.variantId}
                            className="flex justify-between text-xs text-muted-foreground"
                          >
                            <span>
                              {item.productName} - {item.variantName}
                            </span>
                            <span>
                              {item.orderQty}{' '}
                              {t('stockAlertsPage.autoReorder.unit')} ×{' '}
                              {formatCurrency(item.unitPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-right font-medium border-t pt-1">
                        {t('stockAlertsPage.autoReorder.subtotal')}:{' '}
                        {formatCurrency(subtotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Products with no historical supplier */}
            {preview.noSupplierVariants.length > 0 && (
              <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 space-y-1 dark:bg-yellow-900/20 dark:border-yellow-700/50">
                <div className="flex items-center gap-2 text-sm font-medium text-yellow-800 dark:text-yellow-500">
                  <AlertCircle className="h-4 w-4" />
                  {preview.noSupplierVariants.length}{' '}
                  {t('stockAlertsPage.autoReorder.skippedVariants')}
                </div>
                {preview.noSupplierVariants.map((v) => (
                  <p
                    key={v.variantId}
                    className="text-xs text-yellow-700 dark:text-yellow-600 ml-6"
                  >
                    {v.productName} - {v.variantName} ({v.sku})
                  </p>
                ))}
              </div>
            )}

            {preview.groups.length === 0 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {t('stockAlertsPage.autoReorder.noReorderData')}
              </div>
            )}
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={executeMutation.isPending}>
            {t('stockAlertsPage.autoReorder.cancel')}
          </AlertDialogCancel>
          {preview && preview.groups.length > 0 && (
            <Button
              onClick={handleExecute}
              disabled={executeMutation.isPending}
            >
              {executeMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {t('stockAlertsPage.autoReorder.execute', {
                count: preview.groups.length,
              })}{' '}
              {t('stockAlertsPage.autoReorder.draftPo')}
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
