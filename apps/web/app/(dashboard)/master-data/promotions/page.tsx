'use client';

import { Button } from '@bizflow/ui';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PromotionsPage() {
  const t = useTranslations('promotions');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          {t('createLabel')}
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('comingSoon.title')}</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {t('comingSoon.desc1')}
        </p>
        <p className="text-sm text-muted-foreground">{t('comingSoon.desc2')}</p>
      </div>
    </div>
  );
}
