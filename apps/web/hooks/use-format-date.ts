import { useSettingsStore } from '@/stores/settings.store';
import { format as dateFnsFormat } from 'date-fns';
import { id as idLocale, enUS as enLocale } from 'date-fns/locale';

/**
 * Convert storage format key (e.g. 'DD/MM/YYYY') to a date-fns pattern string.
 */
function toDateFnsPattern(storedFormat: string): string {
  switch (storedFormat) {
    case 'MM/DD/YYYY':
      return 'MM/dd/yyyy';
    case 'YYYY-MM-DD':
      return 'yyyy-MM-dd';
    case 'DD MMM YYYY':
      return 'dd MMM yyyy';
    case 'DD MMMM YYYY':
      return 'dd MMMM yyyy';
    case 'DD/MM/YYYY':
    default:
      return 'dd/MM/yyyy';
  }
}

/**
 * Build formatting functions based on a stored date_format value.
 * Can be used outside React components (e.g. export columns).
 */
export function buildFormatters(storedFormat: string) {
  const datePattern = toDateFnsPattern(storedFormat);
  const locale = idLocale;

  const toDate = (date: Date | string) =>
    typeof date === 'string' ? new Date(date) : date;

  return {
    /** Format date only, respecting the user's preferred date format. */
    formatDate: (date: Date | string): string =>
      dateFnsFormat(toDate(date), datePattern, { locale }),

    /** Format date + HH:mm. */
    formatDateTime: (date: Date | string): string =>
      dateFnsFormat(toDate(date), `${datePattern} HH:mm`, { locale }),

    /** Format date + HH:mm:ss (audit logs, etc). */
    formatDateTimeFull: (date: Date | string): string =>
      dateFnsFormat(toDate(date), `${datePattern} HH:mm:ss`, { locale }),

    /** Format time only (HH:mm). */
    formatTime: (date: Date | string): string =>
      dateFnsFormat(toDate(date), 'HH:mm', { locale }),
  };
}

/** Type for the formatters returned by buildFormatters / useFormatDate.
 *  Pass this as a parameter to getColumns() instead of calling the hook inside. */
export type DateFormatters = ReturnType<typeof buildFormatters>;

/**
 * React hook that returns date formatting functions tied to the user's
 * `date_format` AppSetting.
 *
 * Usage:
 *   const { formatDate, formatDateTime } = useFormatDate();
 *   return <span>{formatDate(item.createdAt)}</span>;
 */
export function useFormatDate() {
  const dateFormat = useSettingsStore((s) => s.dateFormat);
  return buildFormatters(dateFormat);
}
