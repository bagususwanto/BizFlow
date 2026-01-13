import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Wallet,
  Settings,
} from 'lucide-react';

export const navigationConfig = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboard,
    },
    {
      title: 'Penjualan',
      url: '/sales',
      icon: ShoppingCart,
    },
    {
      title: 'Pembelian',
      url: '/purchases',
      icon: ShoppingBag,
    },
    {
      title: 'Inventaris',
      url: '/inventory',
      icon: Package,
    },
    {
      title: 'Keuangan',
      url: '/finance',
      icon: Wallet,
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      items: [
        {
          title: 'Role & Permission',
          url: '/settings/roles',
        },
      ],
    },
  ],
};
