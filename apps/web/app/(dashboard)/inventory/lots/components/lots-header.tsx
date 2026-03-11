import { useTranslations } from 'next-intl';
import { Button } from '@bizflow/ui';
import { Card } from '@bizflow/ui';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export function LotsHeader() {
  const t = useTranslations('inventory.lots');

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/inventory/lots/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('createLabel')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
