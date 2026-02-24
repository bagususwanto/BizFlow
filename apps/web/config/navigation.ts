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
      title: 'dashboard.title',
      url: '#',
      icon: Home,
      items: [
        {
          title: 'dashboard.overview',
          url: '/dashboard',
        },
        {
          title: 'dashboard.stockAlerts',
          url: '/dashboard/stock-alerts',
        },
      ],
    },

    {
      title: 'masterData.title',
      url: '#',
      icon: Layers,
      items: [
        {
          title: 'masterData.products',
          url: '/master-data/products',
        },
        {
          title: 'masterData.categories',
          url: '/master-data/categories',
        },
        {
          title: 'masterData.units',
          url: '/master-data/units',
        },
        {
          title: 'masterData.customers',
          url: '/master-data/customers',
        },
        {
          title: 'masterData.suppliers',
          url: '/master-data/suppliers',
        },
        {
          title: 'masterData.paymentTerms',
          url: '/master-data/payment-terms',
        },
        {
          title: 'masterData.warehouses',
          url: '/master-data/warehouses',
        },
        {
          title: 'masterData.promotions',
          url: '/master-data/promotions',
        },
      ],
    },
    {
      title: 'inventory.title',
      url: '#',
      icon: Box,
      items: [
        {
          title: 'inventory.stock',
          url: '/inventory/stock',
        },
        {
          title: 'inventory.movements',
          url: '/inventory/movements',
        },
        {
          title: 'inventory.adjustments',
          url: '/inventory/adjustments',
        },
        {
          title: 'inventory.transfers',
          url: '/inventory/transfers',
        },
        {
          title: 'inventory.stockOpname',
          url: '/inventory/opname',
        },
      ],
    },
    {
      title: 'sales.title',
      url: '#',
      icon: DollarSign,
      items: [
        {
          title: 'sales.orders',
          url: '/sales/orders',
        },
        {
          title: 'sales.returns',
          url: '/sales/returns',
        },
        {
          title: 'sales.payments',
          url: '/sales/payments',
        },
      ],
    },
    {
      title: 'purchases.title',
      url: '#',
      icon: Truck,
      items: [
        {
          title: 'purchases.orders',
          url: '/purchases/orders',
        },
        {
          title: 'purchases.goodsReceive',
          url: '/purchases/goods-receive',
        },
        {
          title: 'purchases.returns',
          url: '/purchases/returns',
        },
        {
          title: 'purchases.payments',
          url: '/purchases/payments',
        },
      ],
    },
    {
      title: 'finance.title',
      url: '#',
      icon: CreditCard,
      items: [
        {
          title: 'finance.accounts',
          url: '/finance/accounts',
        },
        {
          title: 'finance.transactions',
          url: '/finance/transactions',
        },
        {
          title: 'finance.expenses',
          url: '/finance/expenses',
        },
      ],
    },
    {
      title: 'reports.title',
      url: '#',
      icon: BarChart,
      items: [
        {
          title: 'reports.sales',
          url: '/reports/sales',
        },
        {
          title: 'reports.inventory',
          url: '/reports/inventory',
        },
        {
          title: 'reports.finance',
          url: '/reports/financial',
        },
      ],
    },
    {
      title: 'settings.title',
      url: '#',
      icon: Settings,
      items: [
        {
          title: 'settings.general',
          url: '/settings/general',
        },
        {
          title: 'settings.users',
          url: '/settings/users',
        },
        {
          title: 'settings.roles',
          url: '/settings/roles',
        },
        {
          title: 'settings.outlets',
          url: '/settings/outlets',
        },
        {
          title: 'settings.auditLogs',
          url: '/settings/audit-logs',
        },
        {
          title: 'settings.printers',
          url: '/settings/printers',
        },
      ],
    },
  ],
};
