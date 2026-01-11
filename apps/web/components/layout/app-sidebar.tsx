'use client';

import * as React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Package,
  Wallet,
  Settings,
} from 'lucide-react';

import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import { SidebarBranding } from './sidebar-branding';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@bizflow/ui';

// BizFlow Navigation Data
const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboard,
      isActive: true,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBranding />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
