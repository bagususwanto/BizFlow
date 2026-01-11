import { Sidebar, MobileSidebar } from '@/components/layout/sidebar';
import { UserNav } from '@/components/layout/user-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar for desktop */}
      <div className="hidden border-r bg-muted/40 lg:block lg:w-60 lg:fixed lg:inset-y-0 text-zinc-950 dark:text-zinc-50">
        <Sidebar className="h-full" />
      </div>

      <div className="flex flex-col flex-1 lg:pl-60">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
          <MobileSidebar />
          <div className="w-full flex-1">{/* Search or breadcrumbs */}</div>
          <UserNav />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
