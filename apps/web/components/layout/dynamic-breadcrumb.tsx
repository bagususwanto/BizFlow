'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@bizflow/ui';
import { navigationConfig } from '@/config/navigation';

function getBreadcrumbInfo(path: string):
  | {
      title: string;
      isClickable: boolean;
    }
  | undefined {
  for (const group of navigationConfig.navMain) {
    // Check exact group match
    if (group.url === path) return { title: group.title, isClickable: true };

    if (group.items) {
      // Check exact item match
      const item = group.items.find((item) => item.url === path);
      if (item) return { title: item.title, isClickable: true };

      // Check if this group owns this path (is parent of an item)
      // This handles cases like /settings where the group title is "Pengaturan"
      // but the group URL is "#"
      if (group.items.some((item) => item.url.startsWith(path + '/'))) {
        return { title: group.title, isClickable: group.url !== '#' };
      }
    }
  }
  return undefined;
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Always start with Dashboard
  const breadcrumbs = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      isClickable: true,
    },
  ];

  // Build up the breadcrumbs
  let currentPath = '';
  segments.forEach((segment) => {
    // Skip 'dashboard' segment if it's already in the path (since we force added it)
    if (segment === 'dashboard') {
      currentPath += `/${segment}`;
      return;
    }

    currentPath += `/${segment}`;

    // Try to get info from config
    const info = getBreadcrumbInfo(currentPath);

    // Fallback title: Capitalize first letter
    const fallbackTitle =
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    breadcrumbs.push({
      title: info?.title || fallbackTitle,
      href: currentPath,
      isClickable: info ? info.isClickable : true, // Default to clickable if unknown
    });
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <Fragment key={crumb.href}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : crumb.isClickable ? (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>{crumb.title}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="font-medium text-muted-foreground">
                    {crumb.title}
                  </BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
