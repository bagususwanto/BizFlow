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
          // Check if the current path matches the item's URL
          let isMainActive = false;

          if (item.items && item.items.length > 0) {
            isMainActive = pathname === item.url;
          } else {
            isMainActive =
              item.url === '/'
                ? pathname === '/'
                : pathname.startsWith(item.url);
          }

          // Check if any sub-item is active
          const isSubActive = item.items?.some(
            (subItem) => pathname === subItem.url,
          );

          // Item is effectively active if main link matches or child is active
          // Note: NavMain items with sub-items might not have a direct URL action themselves in some designs,
          // but here we check both.
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
