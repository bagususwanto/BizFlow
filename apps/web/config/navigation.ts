import {
  Archive,
  BarChart,
  Box,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Layers,
  Settings,
  ShoppingCart,
  Truck,
  Users,
} from 'lucide-react';

export const getNavigationConfig = (pathname: string) => ({
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard',
    },
    {
      title: 'POS',
      url: '/pos',
      icon: ShoppingCart,
      isActive: pathname.startsWith('/pos'),
    },
    {
      title: 'Master Data',
      url: '#',
      icon: Layers,
      isActive: pathname.startsWith('/master-data'),
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
      ],
    },
    {
      title: 'Inventory',
      url: '#',
      icon: Box,
      isActive: pathname.startsWith('/inventory'),
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
      isActive: pathname.startsWith('/sales'),
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
      isActive: pathname.startsWith('/purchases'),
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
      isActive: pathname.startsWith('/finance'),
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
      isActive: pathname.startsWith('/reports'),
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
      isActive: pathname.startsWith('/settings'),
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
          title: 'Peran',
          url: '/settings/roles',
        },
        {
          title: 'Outlet',
          url: '/settings/outlets',
        },
        {
          title: 'Printer',
          url: '/settings/printer',
        },
        {
          title: 'Backup',
          url: '/settings/backup',
        },
      ],
    },
  ],
});
