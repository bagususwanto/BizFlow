'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bizflow/ui';
import {
  CompanySettingsForm,
  TaxSettingsForm,
  ReceiptSettingsForm,
  DisplaySettingsForm,
  GeneralSettingsForm,
} from '@/components/core/settings';
import { useGroupedSettings } from '@/hooks';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useTranslations } from 'next-intl';

export default function GeneralSettingsPage() {
  const { settings, isLoading, isError, refetch } = useGroupedSettings();
  const t = useTranslations('settings');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <ErrorState
          title={t('loadErrorTitle')}
          message={t('loadErrorMessage')}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start md:w-auto">
            <TabsTrigger value="company">{t('tabs.company')}</TabsTrigger>
            <TabsTrigger value="tax">{t('tabs.tax')}</TabsTrigger>
            <TabsTrigger value="receipt">{t('tabs.receipt')}</TabsTrigger>
            <TabsTrigger value="display">{t('tabs.display')}</TabsTrigger>
            <TabsTrigger value="general">{t('tabs.general')}</TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-4">
          <TabsContent value="company">
            <CompanySettingsForm settings={settings?.company || []} />
          </TabsContent>
          <TabsContent value="tax">
            <TaxSettingsForm settings={settings?.tax || []} />
          </TabsContent>
          <TabsContent value="receipt">
            <ReceiptSettingsForm settings={settings?.receipt || []} />
          </TabsContent>
          <TabsContent value="display">
            <DisplaySettingsForm settings={settings?.display || []} />
          </TabsContent>
          <TabsContent value="general">
            <GeneralSettingsForm settings={settings?.general || []} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
