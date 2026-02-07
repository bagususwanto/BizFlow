import {
  BarChart,
  Box,
  CreditCard,
  DollarSign,
  Home,
  Layers,
  Settings,
  ShoppingCart,
  Truck,
} from 'lucide-react';

export const navigationConfig = {
  navMain: [
    {
      title: 'Dashboard',
      url: '#',
      icon: Home,
      items: [
        {
          title: 'Overview',
          url: '/dashboard',
        },
        {
          title: 'Stock Alerts',
          url: '/dashboard/stock-alerts',
        },
      ],
    },

    {
      title: 'Master Data',
      url: '#',
      icon: Layers,
      items: [
        {
          title: 'Produk',
          url: '/master-data/products',
        },
        {
          title: 'Kategori',
          url: '/master-data/categories',
        },
        {
          title: 'Satuan',
          url: '/master-data/units',
        },
        {
          title: 'Pelanggan',
          url: '/master-data/customers',
        },
        {
          title: 'Pemasok',
          url: '/master-data/suppliers',
        },
        {
          title: 'Gudang',
          url: '/master-data/warehouses',
        },
        {
          title: 'Promosi',
          url: '/master-data/promotions',
        },
      ],
    },
    {
      title: 'Inventory',
      url: '#',
      icon: Box,
      items: [
        {
          title: 'Stok',
          url: '/inventory/stock',
        },
        {
          title: 'Penyesuaian',
          url: '/inventory/adjustments',
        },
        {
          title: 'Transfer',
          url: '/inventory/transfers',
        },
        {
          title: 'Stok Opname',
          url: '/inventory/opname',
        },
      ],
    },
    {
      title: 'Penjualan',
      url: '#',
      icon: DollarSign,
      items: [
        {
          title: 'Pesanan',
          url: '/sales/orders',
        },
        {
          title: 'Retur',
          url: '/sales/returns',
        },
        {
          title: 'Pembayaran',
          url: '/sales/payments',
        },
      ],
    },
    {
      title: 'Pembelian',
      url: '#',
      icon: Truck,
      items: [
        {
          title: 'Pesanan',
          url: '/purchases/orders',
        },
        {
          title: 'Penerimaan',
          url: '/purchases/goods-receive',
        },
        {
          title: 'Retur',
          url: '/purchases/returns',
        },
        {
          title: 'Pembayaran',
          url: '/purchases/payments',
        },
      ],
    },
    {
      title: 'Keuangan',
      url: '#',
      icon: CreditCard,
      items: [
        {
          title: 'Akun',
          url: '/finance/accounts',
        },
        {
          title: 'Transaksi',
          url: '/finance/transactions',
        },
        {
          title: 'Pengeluaran',
          url: '/finance/expenses',
        },
      ],
    },
    {
      title: 'Laporan',
      url: '#',
      icon: BarChart,
      items: [
        {
          title: 'Penjualan',
          url: '/reports/sales',
        },
        {
          title: 'Inventory',
          url: '/reports/inventory',
        },
        {
          title: 'Keuangan',
          url: '/reports/financial',
        },
      ],
    },
    {
      title: 'Pengaturan',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'Umum',
          url: '/settings/general',
        },
        {
          title: 'Pengguna',
          url: '/settings/users',
        },
        {
          title: 'Peran & Akses',
          url: '/settings/roles',
        },
        {
          title: 'Outlet',
          url: '/settings/outlets',
        },
        {
          title: 'Audit Log',
          url: '/settings/audit-logs',
        },
        {
          title: 'Printer',
          url: '/settings/printers',
        },
        // {
        //   title: 'Backup',
        //   url: '/settings/backup',
        // },
      ],
    },
  ],
};
