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
  FormDescription,
} from '@bizflow/ui';
import { AppSetting } from '@bizflow/types';
import { useUpdateSettings } from '@/hooks';

const generalSettingsSchema = z.object({
  language: z.string().min(1, 'Bahasa wajib dipilih'),
  session_timeout: z.coerce
    .number()
    .min(5, 'Session timeout minimal 5 menit')
    .max(1440, 'Session timeout maksimal 24 jam (1440 menit)'),
});

type GeneralSettingsValues = z.infer<typeof generalSettingsSchema>;

interface GeneralSettingsFormProps {
  settings: AppSetting[];
}

export function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema) as any,
    defaultValues: {
      language: 'id',
      session_timeout: 30,
    },
  });

  useEffect(() => {
    if (settings.length > 0) {
      const values: any = {};
      settings.forEach((setting) => {
        if (setting.key === 'session_timeout') {
          values[setting.key] = parseInt(setting.value) || 30;
        } else if (setting.key === 'language') {
          values[setting.key] = setting.value;
        }
      });
      form.reset(values);
    }
  }, [settings, form]);

  const onSubmit = (data: GeneralSettingsValues) => {
    const updateData = [
      { key: 'language', value: data.language },
      { key: 'session_timeout', value: data.session_timeout.toString() },
    ];

    updateSettings({ settings: updateData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Umum System</CardTitle>
        <CardDescription>Pengaturan dasar sistem aplikasi.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Bahasa</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih bahasa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px] overflow-y-auto">
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="session_timeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Session Timeout (Menit)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormDescription>
                    Durasi waktu sesi pengguna akan berakhir setelah tidak ada
                    aktivitas.
                  </FormDescription>
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
