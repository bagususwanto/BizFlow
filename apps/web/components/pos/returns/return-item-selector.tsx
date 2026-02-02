'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
  Input,
  Button,
} from '@bizflow/ui';
import { Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/utils';

export interface ReturnItem {
  orderItemId: string;
  quantity: number;
  reason?: string;
  maxQuantity: number;
  name: string;
  price: number;
  variantName?: string;
}

interface ReturnItemSelectorProps {
  items: any[]; // Order items
  onChange: (items: ReturnItem[]) => void;
}

export function ReturnItemSelector({
  items,
  onChange,
}: ReturnItemSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<
    Record<string, ReturnItem>
  >({});

  const handleSelect = (checked: boolean, item: any) => {
    if (checked) {
      setSelectedItems((prev) => ({
        ...prev,
        [item.id]: {
          orderItemId: item.id,
          quantity: 1,
          maxQuantity: Number(item.quantity), // items from SalesOrder have quantity
          name: item.variant?.product?.name || item.name || 'Unknown',
          variantName: item.variant?.name,
          price: Number(item.unitPrice),
          reason: '',
        },
      }));
    } else {
      const next = { ...selectedItems };
      delete next[item.id];
      setSelectedItems(next);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    const current = selectedItems[id];
    if (!current) return;

    const newQty = Math.max(
      1,
      Math.min(current.maxQuantity, current.quantity + delta),
    );

    setSelectedItems((prev) => {
      const item = prev[id];
      if (!item) return prev;
      return {
        ...prev,
        [id]: { ...item, quantity: newQty },
      };
    });
  };

  const updateReason = (id: string, reason: string) => {
    setSelectedItems((prev) => {
      const item = prev[id];
      if (!item) return prev;
      return {
        ...prev,
        [id]: { ...item, reason },
      };
    });
  };

  useEffect(() => {
    onChange(Object.values(selectedItems));
  }, [selectedItems, onChange]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Pilih</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead className="text-right">Harga</TableHead>
            <TableHead className="text-center">Qty Beli</TableHead>
            <TableHead className="text-center">Qty Return</TableHead>
            <TableHead>Alasan (Opsional)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isSelected = !!selectedItems[item.id];
            const current = selectedItems[item.id];

            return (
              <TableRow
                key={item.id}
                data-state={isSelected ? 'selected' : undefined}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelect(!!checked, item)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {item.variant?.product?.name || item.name}
                    </span>
                    {item.variant?.name && (
                      <span className="text-xs text-muted-foreground">
                        {item.variant.name}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(Number(item.unitPrice))}
                </TableCell>
                <TableCell className="text-center">
                  {item.quantity.toString()}
                </TableCell>
                <TableCell className="text-center">
                  {isSelected ? (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">
                        {current?.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {isSelected && (
                    <Input
                      placeholder="Contoh: Rusak, Expired"
                      value={current?.reason || ''}
                      onChange={(e) => updateReason(item.id, e.target.value)}
                      className="h-8"
                    />
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
