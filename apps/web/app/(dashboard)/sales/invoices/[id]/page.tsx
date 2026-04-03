'use client';

import { Suspense, use } from 'react';
import { InvoiceForm } from '@/components/sales/invoices/invoice-form';
import {
  useSalesInvoice,
  useUpdateSalesInvoiceStatus,
} from '@/hooks/use-sales-invoices';
import {
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Printer,
  StoreIcon,
  MapPin,
  Phone,
  Mail,
  CalendarIcon,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useRouter } from 'next/navigation';
import {
  formatCurrency,
  Badge,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Separator,
  Button,
} from '@bizflow/ui';
import { useFormatDate } from '@/hooks';
import { useState } from 'react';

function EditInvoiceContent({ id }: { id: string }) {
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const updateStatusMutation = useUpdateSalesInvoiceStatus(id);
  const router = useRouter();
  const t = useTranslations('sales.invoices');
  const { data: invoice, isLoading } = useSalesInvoice(id);
  const { formatDateTime } = useFormatDate();

  useBreadcrumb(
    `/sales/invoices/${id}`,
    invoice?.invoiceNumber || t('detailTitle'),
  );

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
        <h2 className="text-xl font-semibold">Invoice tidak ditemukan</h2>
      </div>
    );
  }

  const isDraft = invoice.status === 'draft';

  const handleUpdateStatus = () => {
    if (!nextStatus) return;
    updateStatusMutation.mutate(
      { status: nextStatus as any },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setNextStatus(null);
        },
        onError: () => {
          setStatusDialogOpen(false);
          setNextStatus(null);
        },
      },
    );
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
      case 'paid':
        return 'success';
      case 'cancelled':
        return 'destructive';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/sales/invoices')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {invoice.invoiceNumber}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{formatDateTime(invoice.createdAt)}</span>
              <span>•</span>
              <Badge variant={statusBadgeVariant(invoice.status) as any}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              window.open(`/sales/invoices/${invoice.id}/print`, '_blank')
            }
          >
            <Printer className="mr-2 h-4 w-4" /> {t('actions.print')}
          </Button>

          {invoice.status === 'draft' && (
            <Button
              onClick={() => {
                setNextStatus('sent');
                setStatusDialogOpen(true);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" /> {t('actions.confirm')}
            </Button>
          )}

          {(invoice.status === 'sent' || invoice.status === 'partial') && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setNextStatus('cancelled');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> {t('actions.cancel')}
              </Button>
              {Number(invoice.total) > Number(invoice.paidAmount) && (
                <Button
                  onClick={() =>
                    router.push(
                      `/sales/payments/new?invoiceId=${invoice.id}&customerId=${invoice.customerId}&amount=${Number(invoice.total) - Number(invoice.paidAmount)}`,
                    )
                  }
                >
                  <CreditCard className="mr-2 h-4 w-4" />{' '}
                  {t('actions.processPayment')}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {isDraft ? (
        <InvoiceForm initialData={invoice} />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.customerInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="font-medium">{invoice.customer?.name}</div>
                    {invoice.customer?.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{invoice.customer.address}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {invoice.customer?.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{invoice.customer.phone}</span>
                        </div>
                      )}
                      {invoice.customer?.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{invoice.customer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('detail.invoiceInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t('detail.invoiceDate')}
                  </span>
                  <span className="font-medium">
                    {invoice.invoiceDate
                      ? formatDateTime(invoice.invoiceDate).split(',')[0]
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {t('detail.dueDate')}
                  </span>
                  <span className="font-medium text-destructive">
                    {invoice.dueDate
                      ? formatDateTime(invoice.dueDate).split(',')[0]
                      : '-'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 mt-4 p-4 bg-muted/30 rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t('detail.remainingBalance')}
                  </span>
                  <span className="text-2xl font-bold text-destructive">
                    {formatCurrency(
                      Number(invoice.total) - Number(invoice.paidAmount),
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('detail.items.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('detail.items.product')}</TableHead>
                    <TableHead className="text-right">
                      {t('detail.items.qty')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('detail.items.price')}
                    </TableHead>
                    <TableHead className="text-right">
                      {t('detail.items.subtotal')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item: any) => {
                    const variantData = item.variant || item.orderItem?.variant;
                    const pName =
                      variantData?.product?.name ||
                      variantData?.name ||
                      t('detail.items.unknown');
                    const pSku =
                      variantData?.product?.sku || variantData?.sku || '';

                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{pName}</div>
                          {pSku && (
                            <div className="text-sm text-muted-foreground">
                              {pSku}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(item.quantity)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(item.unitPrice))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(
                            Number(item.quantity) * Number(item.unitPrice),
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.notes')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {invoice.notes || '-'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('detail.payment.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">
                    {t('detail.payment.subtotal')}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(
                      invoice.items?.reduce(
                        (acc: number, item: any) =>
                          acc + Number(item.quantity) * Number(item.unitPrice),
                        0,
                      ) || 0,
                    )}
                  </span>
                </div>
                {/* Asumsi: Invoice tidak memiliki diskon/pajak pada schema basic, jika ada bisa ditambahkan disini */}
                <Separator />
                <div className="flex justify-between text-lg font-bold items-center py-2">
                  <span>{t('detail.payment.total')}</span>
                  <span>{formatCurrency(Number(invoice.total))}</span>
                </div>
                <div className="bg-primary/5 p-3 rounded-md mt-2 flex justify-between items-center text-sm font-medium">
                  <span>{t('detail.payment.paid')}</span>
                  <span className="text-success">
                    {formatCurrency(Number(invoice.paidAmount))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('detail.statusDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('detail.statusDialog.description')}
              <span className="font-bold uppercase">
                {nextStatus || 'draft'}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t('detail.statusDialog.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus}>
              {t('detail.statusDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function EditSalesInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <EditInvoiceContent id={resolvedParams.id} />
    </Suspense>
  );
}
