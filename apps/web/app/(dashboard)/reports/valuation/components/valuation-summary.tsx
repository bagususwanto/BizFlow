import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import { Skeleton } from '@bizflow/ui';
import { Wallet, Layers } from 'lucide-react';
import { StockValuationSummary } from '@/services/stock-valuation.service';

interface ValuationSummaryProps {
  summary?: StockValuationSummary;
  isLoading?: boolean;
}

export function ValuationSummary({ summary, isLoading }: ValuationSummaryProps) {
  const t = useTranslations('valuation.summary');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalValue')}
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatCurrency(summary?.totalInventoryValue || 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('totalValueDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('totalItems')}
          </CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              summary?.totalVariants || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('totalItemsDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
