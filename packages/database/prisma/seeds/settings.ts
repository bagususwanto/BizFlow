import { PrismaClient } from '@prisma/client';

export async function seedSettings(prisma: PrismaClient) {
  const defaultSettings = [
    // Company settings
    {
      key: 'company_name',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Nama Perusahaan',
    },
    {
      key: 'company_address',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Alamat Perusahaan',
    },
    {
      key: 'company_phone',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Telepon',
    },
    {
      key: 'company_email',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Email',
    },
    {
      key: 'company_tax_id',
      value: '',
      type: 'string',
      category: 'company',
      label: 'NPWP',
    },
    {
      key: 'company_logo',
      value: '',
      type: 'string',
      category: 'company',
      label: 'Logo URL',
    },

    // Tax settings
    {
      key: 'default_tax_rate',
      value: '11',
      type: 'number',
      category: 'tax',
      label: 'Tarif Pajak Default (%)',
    },
    {
      key: 'tax_inclusive',
      value: 'false',
      type: 'boolean',
      category: 'tax',
      label: 'Harga Termasuk Pajak',
    },

    // Receipt settings
    {
      key: 'receipt_header',
      value: '',
      type: 'string',
      category: 'receipt',
      label: 'Header Struk',
    },
    {
      key: 'receipt_footer',
      value: 'Terima kasih atas kunjungan Anda',
      type: 'string',
      category: 'receipt',
      label: 'Footer Struk',
    },
    {
      key: 'receipt_show_logo',
      value: 'true',
      type: 'boolean',
      category: 'receipt',
      label: 'Tampilkan Logo',
    },

    // Display settings
    {
      key: 'currency_code',
      value: 'IDR',
      type: 'string',
      category: 'display',
      label: 'Kode Mata Uang',
    },
    {
      key: 'currency_symbol',
      value: 'Rp',
      type: 'string',
      category: 'display',
      label: 'Simbol Mata Uang',
    },
    {
      key: 'date_format',
      value: 'DD/MM/YYYY',
      type: 'string',
      category: 'display',
      label: 'Format Tanggal',
    },
    {
      key: 'timezone',
      value: 'Asia/Jakarta',
      type: 'string',
      category: 'display',
      label: 'Zona Waktu',
    },

    // General settings
    {
      key: 'language',
      value: 'id',
      type: 'string',
      category: 'general',
      label: 'Bahasa',
    },
    {
      key: 'session_timeout',
      value: '30',
      type: 'number',
      category: 'general',
      label: 'Session Timeout (menit)',
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.appSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log('✅ App settings created:', defaultSettings.length, 'settings');
}
