'use client';

import * as React from 'react';

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
import { navigationConfig } from '@/config/navigation';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarBranding />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigationConfig.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
