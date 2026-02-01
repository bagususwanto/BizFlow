'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  ScrollArea,
} from '@bizflow/ui';
import { useCartStore } from '@/stores/cart.store';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/fetch-client';
import { Search, User, Check, Plus } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { Avatar, AvatarFallback } from '@bizflow/ui';

interface CustomerSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerSelector({
  open,
  onOpenChange,
}: CustomerSelectorProps) {
  const { customer, setCustomer } = useCartStore();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', 'search', debouncedSearch],
    queryFn: async () => {
      const response = await apiClient.get<any>(
        `/core/customers?search=${debouncedSearch}&pageSize=10`,
      );
      return response.data || [];
    },
    enabled: open,
  });

  const handleSelect = (cust: any) => {
    setCustomer({
      id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
    });
    onOpenChange(false);
  };

  const clearSelection = () => {
    setCustomer(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pilih Pelanggan</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari pelanggan..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <ScrollArea className="h-[300px] -mx-6 px-6">
          <div className="space-y-2 mt-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={clearSelection}
            >
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Pelanggan Umum</p>
                <p className="text-xs text-muted-foreground">
                  Tanpa data pelanggan
                </p>
              </div>
              {!customer && <Check className="h-4 w-4 text-primary" />}
            </Button>

            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Memuat...
              </div>
            ) : customers.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Tidak ada pelanggan ditemukan
              </div>
            ) : (
              customers.map((cust: any) => (
                <Button
                  key={cust.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3"
                  onClick={() => handleSelect(cust)}
                >
                  <Avatar>
                    <AvatarFallback>
                      {cust.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{cust.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cust.phone || cust.email || '-'}
                    </p>
                  </div>
                  {customer?.id === cust.id && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </Button>
              ))
            )}
          </div>
        </ScrollArea>

        <Button variant="outline" className="w-full gap-2">
          <Plus className="h-4 w-4" /> Tambah Pelanggan Baru
        </Button>
      </DialogContent>
    </Dialog>
  );
}
