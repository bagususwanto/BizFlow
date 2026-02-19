'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Fragment, useEffect, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@bizflow/ui';
import { navigationConfig } from '@/config/navigation';
import { useBreadcrumbContext } from '@/contexts/breadcrumb-context';

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

function formatSegmentTitle(segment: string): string {
  // Handle special segments
  if (segment === 'create') return 'Tambah';

  // Better capitalization for multi-word segments
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  const { overrides } = useBreadcrumbContext();
  const segments = pathname.split('/').filter(Boolean);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    // Check for override first
    let title = overrides[currentPath];

    if (!title) {
      // Try to get info from config
      const info = getBreadcrumbInfo(currentPath);

      if (info) {
        title = info.title;
      } else {
        // Check if this is a UUID/ID segment
        if (isUUID(segment)) {
          title = segment; // Will be replaced by context if available
        } else {
          title = formatSegmentTitle(segment);
        }
      }
    }

    const info = getBreadcrumbInfo(currentPath);
    breadcrumbs.push({
      title,
      href: currentPath,
      isClickable: info ? info.isClickable : true,
    });
  });

  // Generate structured data for SEO (only on client-side)
  const structuredData = mounted
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.title,
          item: `${window.location.origin}${crumb.href}`,
        })),
      }
    : null;

  return (
    <>
      {/* SEO Structured Data - Client-side only to avoid hydration mismatch */}
      {mounted && structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage aria-current="page">
                      {crumb.title}
                    </BreadcrumbPage>
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
    </>
  );
}
