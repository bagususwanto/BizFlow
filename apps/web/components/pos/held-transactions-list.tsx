'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  ScrollArea,
} from '@bizflow/ui';
import { Clock, User, ArrowRight, Trash2 } from 'lucide-react';
import { useHeldTransactions, useResumeTransaction } from '@/hooks/use-pos';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface HeldTransactionsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResume: (transaction: any) => void;
  onDelete: (id: string) => void;
}

export function HeldTransactionsList({
  open,
  onOpenChange,
  onResume,
  onDelete,
}: HeldTransactionsListProps) {
  const { data: heldTransactions, isLoading } = useHeldTransactions();
  const t = useTranslations('pos.held');

  if (isLoading) return null; // Or skeleton

  const transactions = heldTransactions?.data || [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
          <SheetDescription>{t('description')}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center text-muted-foreground py-10">
                {t('empty')}
              </div>
            ) : (
              transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="bg-white border rounded-lg p-4 space-y-3 hover:border-blue-500 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(tx.createdAt), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                        </span>
                      </div>
                      {tx.note && (
                        <p className="text-sm font-medium italic text-foreground">
                          "{tx.note}"
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg">
                        {tx.total
                          ? formatCurrency(Number(tx.total))
                          : formatCurrency(
                              tx.items.reduce(
                                (sum: number, item: any) =>
                                  sum + item.quantity * item.unitPrice,
                                0,
                              ),
                            )}
                      </span>
                    </div>
                  </div>

                  {tx.customer && (
                    <div className="flex items-center gap-2 text-sm text-info bg-info/10 px-2 py-1 rounded w-fit">
                      <User className="h-3 w-3" />
                      {tx.customer.name}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    {t('itemsCount', { count: tx.items.length })} •{' '}
                    {tx.items[0]?.name}
                    {tx.items.length > 1 &&
                      ` ${t('andOthers', { count: tx.items.length - 1 })}`}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                      onClick={() => onDelete(tx.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('deleteBtn')}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onResume(tx)}
                    >
                      {t('resumeBtn')}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
