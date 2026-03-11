import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@bizflow/ui';
import { Skeleton } from '@bizflow/ui';
import { Layers, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockLotsResponse } from '@/services/stock-lots.service';

interface LotsSummaryProps {
  summary?: StockLotsResponse['summary'];
  isLoading?: boolean;
}

export function LotsSummary({ summary, isLoading }: LotsSummaryProps) {
  const t = useTranslations('inventory.lots.summary');

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('total')}
          </CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              summary?.totalLots || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('totalDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('expiringSoon')}
          </CardTitle>
          <AlertTriangle className={cn("h-4 w-4", (summary?.expiringSoon || 0) > 0 ? "text-amber-500" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", (summary?.expiringSoon || 0) > 0 ? "text-amber-500" : "")}>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              summary?.expiringSoon || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('expiringSoonDesc')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            {t('expired')}
          </CardTitle>
          <AlertOctagon className={cn("h-4 w-4", (summary?.expired || 0) > 0 ? "text-red-500" : "text-muted-foreground")} />
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", (summary?.expired || 0) > 0 ? "text-red-500" : "")}>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              summary?.expired || 0
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('expiredDesc')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
