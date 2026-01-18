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
import { useUpdateSettings } from '@/hooks/use-settings';

const displaySettingsSchema = z.object({
  currency_code: z.string().min(1, 'Kode mata uang wajib diisi'),
  currency_symbol: z.string().min(1, 'Simbol mata uang wajib diisi'),
  date_format: z.string().min(1, 'Format tanggal wajib dipilih'),
  timezone: z.string().min(1, 'Zona waktu wajib dipilih'),
});

type DisplaySettingsValues = z.infer<typeof displaySettingsSchema>;

interface DisplaySettingsFormProps {
  settings: AppSetting[];
}

export function DisplaySettingsForm({ settings }: DisplaySettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

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
    }
  }, [settings, form]);

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
        <CardTitle>Tampilan & Format</CardTitle>
        <CardDescription>
          Pengaturan format mata uang, tanggal, dan waktu.
        </CardDescription>
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
                    <FormLabel>Kode Mata Uang</FormLabel>
                    <FormControl>
                      <Input placeholder="IDR" {...field} />
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
                    <FormLabel>Simbol Mata Uang</FormLabel>
                    <FormControl>
                      <Input placeholder="Rp" {...field} />
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
                  <FormLabel>Format Tanggal</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih format tanggal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <SelectItem value="DD/MM/YYYY">
                        DD/MM/YYYY (31/12/2024)
                      </SelectItem>
                      <SelectItem value="MM/DD/YYYY">
                        MM/DD/YYYY (12/31/2024)
                      </SelectItem>
                      <SelectItem value="YYYY-MM-DD">
                        YYYY-MM-DD (2024-12-31)
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
                  <FormLabel>Zona Waktu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih zona waktu" />
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
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
