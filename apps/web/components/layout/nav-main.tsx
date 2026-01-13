'use client';

import { usePathname } from 'next/navigation';

import { ChevronRight, type LucideIcon } from 'lucide-react';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@bizflow/ui';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@bizflow/ui';

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          // Helper to check if a URL matches current path
          const isUrlActive = (url: string) =>
            url === '/' ? pathname === '/' : pathname.startsWith(url);

          // Check if main item is active
          // If item has children, it's active if specific URL matches strictly
          // Otherwise check prefix
          const isMainActive =
            item.items && item.items.length > 0
              ? pathname === item.url
              : isUrlActive(item.url);

          // Check if any sub-item is active
          const isSubActive = item.items?.some(
            (subItem) => pathname === subItem.url,
          );

          // Item is effectively active if main link matches or child is active
          const isActive = isMainActive || isSubActive;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive} // Keep open if active
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isMainActive} // Highlight main button if it matches path
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url} // Highlight sub-item if exact match
                        >
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
