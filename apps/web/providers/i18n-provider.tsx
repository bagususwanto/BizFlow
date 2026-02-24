'use client';

import { NextIntlClientProvider } from 'next-intl';
import { useAuthStore } from '@/stores/auth.store';
import { useEffect, useState } from 'react';
import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';

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
    // 1. Load Next-Intl App Messages
    const loader = (messageLoaders[language] || messageLoaders['id'])!;
    loader()
      .then((module) => {
        setMessages(module.default);
      })
      .catch((err) => {
        console.error('Failed to load translations', err);
      });

    // 2. Set up Zod i18n
    const setupZodI18n = async () => {
      try {
        const zodLocaleLoader = (zodLocaleLoaders[language] ||
          zodLocaleLoaders['id'])!;
        const zodTranslations = await zodLocaleLoader();

        await i18next.init({
          lng: language,
          fallbackLng: 'id',
          resources: {
            [language]: { zod: zodTranslations },
          },
        });

        z.setErrorMap(zodI18nMap);
      } catch (err) {
        console.error('Failed to setup Zod translations', err);
      }
    };

    setupZodI18n();
  }, [language]);

  if (!messages) {
    // Return children directly or a small loader while translations load
    // This allows the initial render to happen synchronously instead of breaking SSR
    // But since it's NextIntl, we must provide messages when using its hooks
    // Waiting until messages are loaded prevents hydration mismatches.
    return null;
  }

  return (
    <NextIntlClientProvider locale={language} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
