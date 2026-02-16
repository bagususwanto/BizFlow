export type SupportedLanguage = 'id' | 'en';

export type TranslationKey =
  | 'open.browser'
  | 'server.start'
  | 'server.stop'
  | 'server.restart'
  | 'logs.view'
  | 'backup.create'
  | 'status.running'
  | 'status.stopped'
  | 'quit';

const TRANSLATIONS: Record<
  SupportedLanguage,
  Record<TranslationKey, string>
> = {
  en: {
    'open.browser': 'Open in Browser',
    'server.start': 'Start Server',
    'server.stop': 'Stop Server',
    'server.restart': 'Restart Server',
    'logs.view': 'View Logs',
    'backup.create': 'Backup Now',
    'status.running': 'Server Running',
    'status.stopped': 'Server Stopped',
    quit: 'Quit',
  },
  id: {
    'open.browser': 'Buka di Browser',
    'server.start': 'Nyalakan Server',
    'server.stop': 'Matikan Server',
    'server.restart': 'Restart Server',
    'logs.view': 'Lihat Logs',
    'backup.create': 'Backup Sekarang',
    'status.running': 'Server Berjalan',
    'status.stopped': 'Server Berhenti',
    quit: 'Keluar',
  },
};

/**
 * Get a translated string by key.
 */
export function t(language: SupportedLanguage, key: TranslationKey): string {
  return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.id[key] ?? key;
}
