import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { AppSetting } from '@bizflow/types';
import { useUpdateSettings } from '@/hooks';
import { useSettingsStore } from '@/stores/settings.store';
import { Save } from 'lucide-react';
import { useTranslations } from 'next-intl';

const displaySettingsSchema = z.object({
  currency_code: z.string().min(1, 'settings.display.currencyCodeError'),
  currency_symbol: z.string().min(1, 'settings.display.currencySymbolError'),
  date_format: z.string().min(1, 'settings.display.dateFormatError'),
  timezone: z.string().min(1, 'settings.display.timezoneError'),
});

type DisplaySettingsValues = z.infer<typeof displaySettingsSchema>;

interface DisplaySettingsFormProps {
  settings: AppSetting[];
}

export function DisplaySettingsForm({ settings }: DisplaySettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const setDateFormat = useSettingsStore((s) => s.setDateFormat);
  const t = useTranslations('settings');

  const form = useForm<DisplaySettingsValues>({
    resolver: zodResolver(displaySettingsSchema),
    defaultValues: {
      currency_code: 'IDR',
      currency_symbol: 'Rp',
      date_format: 'DD/MM/YYYY',
      timezone: 'Asia/Jakarta',
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const values: any = {};
      settings.forEach((setting) => {
        if (setting.key in displaySettingsSchema.shape) {
          values[setting.key] = setting.value;
        }
      });
      form.reset(values);

      // Sync date_format to settings store so useFormatDate picks it up on load
      const dateFormatSetting = settings.find((s) => s.key === 'date_format');
      if (dateFormatSetting?.value) {
        setDateFormat(dateFormatSetting.value);
      }
    }
  }, [settings, form, setDateFormat]);

  const onSubmit = (data: DisplaySettingsValues) => {
    const updateData = Object.entries(data).map(([key, value]) => ({
      key,
      value: value || '',
    }));

    updateSettings({ settings: updateData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('display.title')}</CardTitle>
        <CardDescription>{t('display.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="currency_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t('display.currencyCodeLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('display.currencyCodePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currency_symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t('display.currencySymbolLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('display.currencySymbolPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date_format"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('display.dateFormatLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('display.dateFormatPlaceholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <SelectItem value="DD/MM/YYYY">
                        DD/MM/YYYY &mdash; 26/02/2026
                      </SelectItem>
                      <SelectItem value="MM/DD/YYYY">
                        MM/DD/YYYY &mdash; 02/26/2026
                      </SelectItem>
                      <SelectItem value="YYYY-MM-DD">
                        YYYY-MM-DD &mdash; 2026-02-26
                      </SelectItem>
                      <SelectItem value="DD MMM YYYY">
                        DD MMM YYYY &mdash; 26 Feb 2026
                      </SelectItem>
                      <SelectItem value="DD MMMM YYYY">
                        DD MMMM YYYY &mdash; 26 Februari 2026
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('display.timezoneLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('display.timezonePlaceholder')}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <SelectItem value="Asia/Jakarta">
                        WIB (Asia/Jakarta)
                      </SelectItem>
                      <SelectItem value="Asia/Makassar">
                        WITA (Asia/Makassar)
                      </SelectItem>
                      <SelectItem value="Asia/Jayapura">
                        WIT (Asia/Jayapura)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  t('savingBtn')
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {t('saveBtn')}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
