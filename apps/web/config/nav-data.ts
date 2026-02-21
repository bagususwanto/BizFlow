import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  FileText,
  CreditCard,
  Package,
  ShoppingCart,
  Truck,
  Building2,
  Database,
  FolderTree,
  Printer,
} from 'lucide-react';

export const navData = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard:read',
    submenu: [
      {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard:read',
      },
      {
        title: 'Stock Alerts',
        href: '/dashboard/stock-alerts',
        icon: Package,
        permission: 'dashboard:read',
      },
    ],
  },
  {
    title: 'Master Data',
    href: '/master-data',
    icon: Database,
    submenu: [
      {
        title: 'Kategori',
        href: '/master-data/categories',
        icon: FolderTree,
        permission: 'categories:read',
      },
      {
        title: 'Produk',
        href: '/master-data/products',
        icon: Package,
        permission: 'products:read',
      },
      {
        title: 'Pelanggan',
        href: '/master-data/customers',
        icon: Users,
        permission: 'customers:read',
      },
      {
        title: 'Pemasok',
        href: '/master-data/suppliers',
        icon: Truck,
        permission: 'suppliers:read',
      },
      {
        title: 'Termin Pembayaran',
        href: '/master-data/payment-terms',
        icon: FileText,
        permission: 'payment-terms:read',
      },
      {
        title: 'Satuan',
        href: '/master-data/units',
        icon: Package,
        permission: 'units:read',
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    submenu: [
      {
        title: 'Users',
        href: '/settings/users',
        icon: Users,
        permission: 'users:read',
      },
      {
        title: 'Roles',
        href: '/settings/roles',
        icon: Shield,
        permission: 'roles:read',
      },
      {
        title: 'Outlets',
        href: '/settings/outlets',
        icon: Building2,
        permission: 'outlets:read',
      },
      {
        title: 'Printers',
        href: '/settings/printers',
        icon: Printer,
        permission: 'settings:read',
      },
      {
        title: 'License',
        href: '/settings/license',
        icon: CreditCard,
        permission: 'license:read',
      },
      {
        title: 'Audit Logs',
        href: '/settings/audit-logs',
        icon: FileText,
        permission: 'audit-log:read',
      },
    ],
  },
  // Placeholder for other modules
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Package,
    permission: 'inventory:read',
  },
  {
    title: 'Sales',
    href: '/sales',
    icon: ShoppingCart,
    permission: 'sales:read',
  },
  {
    title: 'Purchases',
    href: '/purchases',
    icon: Truck,
    permission: 'purchases:read',
  },
];
