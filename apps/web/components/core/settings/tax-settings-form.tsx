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
  Switch,
  FormDescription,
} from '@bizflow/ui';
import { AppSetting } from '@bizflow/types';
import { useUpdateSettings } from '@/hooks';
import { Save } from 'lucide-react';

const taxSettingsSchema = z.object({
  default_tax_rate: z.coerce.number().min(0, 'Pajak tidak boleh kurang dari 0'),
  tax_inclusive: z.boolean(),
});

type TaxSettingsValues = z.infer<typeof taxSettingsSchema>;

interface TaxSettingsFormProps {
  settings: AppSetting[];
}

export function TaxSettingsForm({ settings }: TaxSettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<TaxSettingsValues>({
    resolver: zodResolver(taxSettingsSchema) as any,
    defaultValues: {
      default_tax_rate: 0,
      tax_inclusive: false,
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const values: any = {};
      settings.forEach((setting) => {
        if (setting.key === 'default_tax_rate') {
          values[setting.key] = parseFloat(setting.value) || 0;
        } else if (setting.key === 'tax_inclusive') {
          values[setting.key] = setting.value === 'true';
        }
      });
      form.reset(values);
    }
  }, [settings, form]);

  const onSubmit = (data: TaxSettingsValues) => {
    const updateData = [
      { key: 'default_tax_rate', value: data.default_tax_rate.toString() },
      { key: 'tax_inclusive', value: data.tax_inclusive.toString() },
    ];

    updateSettings({ settings: updateData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Pajak</CardTitle>
        <CardDescription>
          Konfigurasi pajak default untuk transaksi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="default_tax_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tarif Pajak Default (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Persentase pajak yang diterapkan secara otomatis (contoh: 11
                    untuk PPN).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tax_inclusive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Harga Termasuk Pajak
                    </FormLabel>
                    <FormDescription>
                      Jika aktif, harga produk yang diinput sudah termasuk
                      pajak.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  'Menyimpan...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
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
