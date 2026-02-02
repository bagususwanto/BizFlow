'use client';

import {
  Menu,
  Wifi,
  WifiOff,
  LogOut,
  History,
  ArrowLeft,
  Clock,
  Keyboard,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@bizflow/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bizflow/ui';
import { useAuthStore } from '@/stores/auth.store';
import { Badge } from '@bizflow/ui';
import { useState, useEffect } from 'react';
import { useHeldTransactions } from '@/hooks/use-pos';

interface PosHeaderProps {
  onOpenHeldList?: () => void;
  onHelpClick?: () => void;
}

export function PosHeader({ onOpenHeldList, onHelpClick }: PosHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const [isOnline, setIsOnline] = useState(true);
  const { data: heldTransactions } = useHeldTransactions();
  const heldCount = heldTransactions?.data?.length || 0;

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </Link>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold">POS Terminal</h1>
        <Badge
          variant={isOnline ? 'outline' : 'destructive'}
          className="gap-1.5 hidden sm:flex"
        >
          {isOnline ? (
            <Wifi className="h-3 w-3" />
          ) : (
            <WifiOff className="h-3 w-3" />
          )}
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        {onHelpClick && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground mr-1 hidden sm:flex"
            onClick={onHelpClick}
          >
            <Keyboard className="h-4 w-4" />
            <span className="text-xs">Shortcuts (F1)</span>
          </Button>
        )}

        {onOpenHeldList && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 mr-2 relative"
            onClick={onOpenHeldList}
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Transaksi Tersimpan</span>
            {heldCount > 0 && (
              <Badge className="ml-1 h-5 min-w-5 px-1 py-0 justify-center flex items-center bg-orange-500 hover:bg-orange-600">
                {heldCount}
              </Badge>
            )}
          </Button>
        )}

        <div className="hidden text-right text-sm sm:block">
          <p className="font-medium">{user?.username || 'Cashier'}</p>
          <p className="text-xs text-muted-foreground">
            {user?.role || 'Staff'}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Menu Kasir</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <History className="mr-2 h-4 w-4" />
              Riwayat Transaksi
            </DropdownMenuItem>
            <Link href="/pos/returns">
              <DropdownMenuItem>
                <History className="mr-2 h-4 w-4" />
                Riwayat Retur
              </DropdownMenuItem>
            </Link>
            {onOpenHeldList && (
              <DropdownMenuItem onClick={onOpenHeldList}>
                <Clock className="mr-2 h-4 w-4" />
                Pending Transactions
              </DropdownMenuItem>
            )}
            {onHelpClick && (
              <DropdownMenuItem onClick={onHelpClick}>
                <Keyboard className="mr-2 h-4 w-4" />
                Keyboard Shortcuts
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <Link
              href="/auth/login"
              onClick={() => useAuthStore.getState().logout()}
            >
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
