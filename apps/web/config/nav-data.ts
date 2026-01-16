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
} from 'lucide-react';

export const navData = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard:read',
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
