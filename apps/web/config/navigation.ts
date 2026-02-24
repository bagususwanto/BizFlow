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
          title: 'Products',
          url: '/master-data/products',
        },
        {
          title: 'Categories',
          url: '/master-data/categories',
        },
        {
          title: 'Units',
          url: '/master-data/units',
        },
        {
          title: 'Customers',
          url: '/master-data/customers',
        },
        {
          title: 'Suppliers',
          url: '/master-data/suppliers',
        },
        {
          title: 'Payment Terms',
          url: '/master-data/payment-terms',
        },
        {
          title: 'Warehouses',
          url: '/master-data/warehouses',
        },
        {
          title: 'Promotions',
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
          title: 'Stock',
          url: '/inventory/stock',
        },
        {
          title: 'Movements',
          url: '/inventory/movements',
        },
        {
          title: 'Adjustments',
          url: '/inventory/adjustments',
        },
        {
          title: 'Transfers',
          url: '/inventory/transfers',
        },
        {
          title: 'Stock Opname',
          url: '/inventory/opname',
        },
      ],
    },
    {
      title: 'Sales',
      url: '#',
      icon: DollarSign,
      items: [
        {
          title: 'Orders',
          url: '/sales/orders',
        },
        {
          title: 'Returns',
          url: '/sales/returns',
        },
        {
          title: 'Payments',
          url: '/sales/payments',
        },
      ],
    },
    {
      title: 'Purchases',
      url: '#',
      icon: Truck,
      items: [
        {
          title: 'Orders',
          url: '/purchases/orders',
        },
        {
          title: 'Goods Receive',
          url: '/purchases/goods-receive',
        },
        {
          title: 'Returns',
          url: '/purchases/returns',
        },
        {
          title: 'Payments',
          url: '/purchases/payments',
        },
      ],
    },
    {
      title: 'Finance',
      url: '#',
      icon: CreditCard,
      items: [
        {
          title: 'Accounts',
          url: '/finance/accounts',
        },
        {
          title: 'Transactions',
          url: '/finance/transactions',
        },
        {
          title: 'Expenses',
          url: '/finance/expenses',
        },
      ],
    },
    {
      title: 'Reports',
      url: '#',
      icon: BarChart,
      items: [
        {
          title: 'Sales',
          url: '/reports/sales',
        },
        {
          title: 'Inventory',
          url: '/reports/inventory',
        },
        {
          title: 'Finance',
          url: '/reports/financial',
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'General',
          url: '/settings/general',
        },
        {
          title: 'Users',
          url: '/settings/users',
        },
        {
          title: 'Roles & Access',
          url: '/settings/roles',
        },
        {
          title: 'Outlets',
          url: '/settings/outlets',
        },
        {
          title: 'Audit Logs',
          url: '/settings/audit-logs',
        },
        {
          title: 'Printers',
          url: '/settings/printers',
        },
        // {
        //   title: 'Backups',
        //   url: '/settings/backup',
        // },
      ],
    },
  ],
};
