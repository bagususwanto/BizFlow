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
  Textarea,
} from '@bizflow/ui';
import { AppSetting } from '@bizflow/types';
import { useUpdateSettings } from '@/hooks';

const companySettingsSchema = z.object({
  company_name: z.string().min(1, 'Nama perusahaan wajib diisi'),
  company_address: z.string().optional(),
  company_phone: z.string().optional(),
  company_email: z
    .string()
    .email('Email tidak valid')
    .optional()
    .or(z.literal('')),
  company_tax_id: z.string().optional(),
  company_logo: z
    .string()
    .url('URL logo tidak valid')
    .optional()
    .or(z.literal('')),
});

type CompanySettingsValues = z.infer<typeof companySettingsSchema>;

interface CompanySettingsFormProps {
  settings: AppSetting[];
}

export function CompanySettingsForm({ settings }: CompanySettingsFormProps) {
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<CompanySettingsValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      company_name: '',
      company_address: '',
      company_phone: '',
      company_email: '',
      company_tax_id: '',
      company_logo: '',
    },
  });

  // Populate form with settings values
  useEffect(() => {
    if (settings.length > 0) {
      const values: any = {};
      settings.forEach((setting) => {
        if (setting.key in companySettingsSchema.shape) {
          values[setting.key] = setting.value;
        }
      });
      form.reset(values);
    }
  }, [settings, form]);

  const onSubmit = (data: CompanySettingsValues) => {
    const updateData = Object.entries(data).map(([key, value]) => ({
      key,
      value: value || '',
    }));

    updateSettings({ settings: updateData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Perusahaan</CardTitle>
        <CardDescription>
          Detail perusahaan yang akan ditampilkan pada struk dan laporan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Perusahaan</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: PT BizFlow Indonesia"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="company_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="email@perusahaan.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="021-xxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="company_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Alamat lengkap perusahaan"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_tax_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NPWP</FormLabel>
                  <FormControl>
                    <Input placeholder="Nomor Pokok Wajib Pajak" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Logo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      {...field}
                    />
                  </FormControl>
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
