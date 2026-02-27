import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Badge,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Calendar,
} from '@bizflow/ui';
import { useStockCard } from '@/hooks/use-stock-movements';
import { format } from 'date-fns';
import { useFormatDate } from '@/hooks';
import { id } from 'date-fns/locale';
import {
  Loader2,
  ArrowDown,
  ArrowUp,
  ArrowRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { StockMovement } from '@/services/stock.service';
import { cn } from '@/lib/utils';

type DateRange = {
  from: Date | undefined;
  to?: Date | undefined;
};

interface StockCardDialogProps {
  variantId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId?: string;
}

export function StockCardDialog({
  variantId,
  open,
  onOpenChange,
  warehouseId,
}: StockCardDialogProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Reset filter when dialog opens/closes or variant changes
  useEffect(() => {
    if (!open) {
      setDateRange(undefined);
    }
  }, [open, variantId]);

  const { data, isLoading } = useStockCard(variantId || '', {
    warehouseId: warehouseId !== 'all' ? warehouseId : undefined,
    dateFrom: dateRange?.from ? dateRange.from.toISOString() : undefined,
    dateTo: dateRange?.to ? dateRange.to.toISOString() : undefined,
  });

  const variantName = data?.variant
    ? `${data.variant.product.name} ${
        data.variant.name !== 'Default' ? `- ${data.variant.name}` : ''
      }`
    : 'Stock Card';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <DialogTitle>{variantName}</DialogTitle>
            <DialogDescription>
              Riwayat pergerakan stok dan saldo berjalan
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 mr-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-[260px] justify-start text-left font-normal',
                    !dateRange && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd MMM yyyy', { locale: id })}{' '}
                        - {format(dateRange.to, 'dd MMM yyyy', { locale: id })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd MMM yyyy', { locale: id })
                    )
                  ) : (
                    <span>Pilih Tanggal</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="min-w-[400px]"
                />
              </PopoverContent>
            </Popover>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto min-h-0">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-lg border p-3 text-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Saldo Awal
                </div>
                <div className="text-xl font-bold">
                  {data?.openingBalance || 0}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Pergerakan Net
                </div>
                <div className="text-xl font-bold">
                  {(data?.closingBalance || 0) - (data?.openingBalance || 0)}
                </div>
              </div>
              <div className="rounded-lg border p-3 text-center bg-muted/50">
                <div className="text-sm font-medium text-muted-foreground">
                  Saldo Akhir
                </div>
                <div className="text-xl font-bold text-primary">
                  {data?.closingBalance || 0}
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>No. Ref</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Gudang</TableHead>
                    <TableHead className="text-right">Masuk</TableHead>
                    <TableHead className="text-right">Keluar</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.movements.map((movement) => (
                    <StockMovementRow key={movement.id} movement={movement} />
                  ))}
                  {!data?.movements.length && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-24 text-center text-muted-foreground"
                      >
                        Tidak ada riwayat pergerakan
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StockMovementRow({
  movement,
}: {
  movement: StockMovement & { balance: number };
}) {
  const isIn = movement.quantity > 0;
  const qty = Math.abs(movement.quantity);
  const { formatDate, formatTime } = useFormatDate();

  let color: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
  let icon = null;

  switch (movement.type) {
    case 'SALE':
    case 'TRANSFER_OUT':
    case 'USAGE':
      color = 'destructive';
      icon = <ArrowUp className="mr-1 h-3 w-3" />;
      break;
    case 'PURCHASE':
    case 'TRANSFER_IN':
    case 'RETURN':
      color = 'default';
      icon = <ArrowDown className="mr-1 h-3 w-3" />;
      break;
    case 'ADJUSTMENT':
    case 'OPNAME':
      color = 'secondary';
      icon = <ArrowRight className="mr-1 h-3 w-3" />;
      break;
    default:
      color = 'outline';
  }

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{formatDate(movement.createdAt)}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(movement.createdAt)}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col text-xs">
          <span className="font-medium">{movement.referenceId || '-'}</span>
          <span className="text-muted-foreground">
            {movement.referenceType || '-'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={color}
          className="flex w-fit items-center text-[10px] px-1 py-0 h-5"
        >
          {movement.type.replace('_', ' ')}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{movement.warehouse.name}</TableCell>
      <TableCell className="text-right font-medium text-success">
        {isIn ? qty : '-'}
      </TableCell>
      <TableCell className="text-right font-medium text-destructive">
        {!isIn ? qty : '-'}
      </TableCell>
      <TableCell className="text-right font-bold">{movement.balance}</TableCell>
    </TableRow>
  );
}
