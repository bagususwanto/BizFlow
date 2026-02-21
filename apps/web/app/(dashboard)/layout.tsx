import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Separator,
} from '@bizflow/ui';
import { DynamicBreadcrumb } from '@/components/layout/dynamic-breadcrumb';
import { BreadcrumbProvider } from '@/contexts/breadcrumb-context';
import Link from 'next/link';
import { Button } from '@bizflow/ui';
import { ShoppingCart } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BreadcrumbProvider>
      <SidebarProvider>
        <AppSidebar className="print:hidden" />
        <SidebarInset>
          <header className="print:hidden sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <DynamicBreadcrumb />
            </div>
            <div className="ml-auto px-4">
              <Link href="/pos">
                <Button variant="outline" size="sm">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  POS
                </Button>
              </Link>
            </div>
          </header>
          <main className="flex flex-1 flex-col">
            <div className="flex-1 p-4 md:p-6 min-w-0">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </BreadcrumbProvider>
  );
}
