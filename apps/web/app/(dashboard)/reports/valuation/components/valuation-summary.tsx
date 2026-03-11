import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import { Skeleton } from '@bizflow/ui';
import { Wallet, Package, Layers, Calculator } from 'lucide-react';
import { StockValuationResponse } from '@/services/stock-valuation.service';

interface ValuationSummaryProps {
  summary?: StockValuationResponse['summary'];
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              formatCurrency(summary?.totalValue || 0)
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
            {t('totalStock')}
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              summary?.totalQuantity || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('totalStockDesc')}
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
              summary?.totalItems || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('totalItemsDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('avgValuePerItem')}
          </CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatCurrency(summary?.averageValuePerItem || 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('avgValuePerItemDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
