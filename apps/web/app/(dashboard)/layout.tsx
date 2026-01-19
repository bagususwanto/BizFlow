import { AppSidebar } from '@/components/layout/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Separator,
} from '@bizflow/ui';
import { DynamicBreadcrumb } from '@/components/layout/dynamic-breadcrumb';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 p-4 md:p-6 min-w-0">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
