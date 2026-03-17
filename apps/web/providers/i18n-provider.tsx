'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';
import { FormErrorTranslatorContext } from '@bizflow/ui';

const messageLoaders: Record<string, () => Promise<any>> = {
  en: () => import('../messages/en.json'),
  id: () => import('../messages/id.json'),
};

const zodLocaleLoaders: Record<string, () => Promise<any>> = {
  en: () => import('zod-i18n-map/locales/en/zod.json'),
  id: () => import('zod-i18n-map/locales/id/zod.json'),
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { language } = useAuthStore();
  const [messages, setMessages] = useState<any>(null);

  useEffect(() => {
    const setupI18n = async () => {
      try {
        const zodLocaleLoader = (zodLocaleLoaders[language] ||
          zodLocaleLoaders['id'])!;
        const appMessageLoader = (messageLoaders[language] ||
          messageLoaders['id'])!;

        const [zodTranslations, appMessagesModule] = await Promise.all([
          zodLocaleLoader(),
          appMessageLoader(),
        ]);

        const appMessages = appMessagesModule.default;
        setMessages(appMessages);

        await i18next.init({
          lng: language,
          fallbackLng: 'id',
          resources: {
            [language]: { zod: zodTranslations },
          },
        });

        const customMap: z.ZodErrorMap = (issue, ctx) => {
          if (issue.message && issue.message.includes('.')) {
            const keys = issue.message.split('.');
            let val = appMessages;
            for (const k of keys) {
              if (val) val = val[k];
            }
            if (typeof val === 'string') return { message: val };
          }
          return zodI18nMap(issue, ctx);
        };

        z.setErrorMap(customMap);
      } catch (err) {
        console.error('Failed to setup translations', err);
      }
    };

    setupI18n();
  }, [language]);

  if (!messages) {
    // Return children directly or a small loader while translations load
    // This allows the initial render to happen synchronously instead of breaking SSR
    // But since it's NextIntl, we must provide messages when using its hooks
    // Waiting until messages are loaded prevents hydration mismatches.
    return null;
  }

  const translateError = (message: string) => {
    if (!messages || !message.includes('.')) return message;
    const keys = message.split('.');
    let val = messages;
    for (const key of keys) {
      if (val && val[key]) {
        val = val[key];
      } else {
        return message;
      }
    }
    return typeof val === 'string' ? val : message;
  };

  return (
    <NextIntlClientProvider locale={language} messages={messages}>
      <FormErrorTranslatorContext.Provider value={translateError}>
        {children}
      </FormErrorTranslatorContext.Provider>
    </NextIntlClientProvider>
  );
}
