import { useEffect, useState } from 'react';

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
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // Sync open groups with pathname on mount and navigation
  useEffect(() => {
    const activeItem = items.find((item) =>
      item.items?.some(
        (subItem) =>
          pathname === subItem.url || pathname.startsWith(subItem.url),
      ),
    );

    if (activeItem && !openGroups.includes(activeItem.title)) {
      setOpenGroups((prev) => [...prev, activeItem.title]);
    }
  }, [pathname, items]);

  const handleOpenChange = (title: string, isOpen: boolean) => {
    setOpenGroups((prev) =>
      isOpen ? [...prev, title] : prev.filter((t) => t !== title),
    );
  };

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          // Helper to check if a URL matches current path
          const isUrlActive = (url: string) =>
            url === '/' ? pathname === '/' : pathname.startsWith(url);

          // Check if main item is active
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

          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isMainActive}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          const isOpen = openGroups.includes(item.title);

          return (
            <Collapsible
              key={item.title}
              asChild
              open={isOpen}
              onOpenChange={(open) => handleOpenChange(item.title, open)}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isMainActive}
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
                          isActive={pathname === subItem.url}
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
