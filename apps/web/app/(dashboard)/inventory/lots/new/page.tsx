import { useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { StockLotForm } from '@/components/inventory/stock-lot-form';

export default function CreateStockLotPage() {
  const t = useTranslations('inventory.lots');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link href="/inventory" className="hover:underline">
          {t('title')}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/inventory/lots" className="hover:underline">
          {t('title')}
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{t('create.title')}</span>
      </div>

      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('create.title')}</h2>
          <p className="text-muted-foreground">{t('create.subtitle')}</p>
        </div>
      </div>

      <div className="max-w-4xl pt-4">
        <StockLotForm />
      </div>
    </div>
  );
}
