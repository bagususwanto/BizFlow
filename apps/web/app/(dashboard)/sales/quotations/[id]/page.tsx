'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarIcon,
  StoreIcon,
  ArrowLeft,
  Trash,
  CheckCircle,
  XCircle,
  Edit,
  Printer,
  MapPin,
  Phone,
  Mail,
  Send,
  FileBox,
} from 'lucide-react';
import { useFormatDate } from '@/hooks';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Badge,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  formatCurrency,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Input,
  Textarea
} from '@bizflow/ui';
import { quotationsService } from '@/services/quotations.service';
import { LoadingState } from '@/components/common/loading-state';
import { ErrorState } from '@/components/common/error-state';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { DeleteConfirmDialog } from '@/components/shared/delete-confirm-dialog';
import {
  useDeleteQuotation,
  useUpdateQuotationStatus,
  useConvertQuotationToSalesOrder
} from '@/hooks/use-quotations';
import { useTranslations } from 'next-intl';

export default function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const t = useTranslations('sales.quotations');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [nextStatus, setNextStatus] = useState<string | null>(null);

  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [convertData, setConvertData] = useState({
    orderDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: ''
  });

  const {
    data: quotation,
    isLoading,
    refetch,
    isError,
  } = useQuery({
    queryKey: ['quotations', resolvedParams.id],
    queryFn: () => quotationsService.getById(resolvedParams.id),
  });

  const deleteMutation = useDeleteQuotation();
  const updateStatusMutation = useUpdateQuotationStatus(resolvedParams.id);
  const convertMutation = useConvertQuotationToSalesOrder(resolvedParams.id);

  const { formatDate, formatDateTime } = useFormatDate();

  useBreadcrumb(
    `/sales/quotations/${resolvedParams.id}`,
    quotation?.quotationNumber || t('actions.detail'),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <LoadingState />
      </div>
    );
  }

  if (isError || !quotation) {
    return (
      <ErrorState title={t('detail.failedLoad')} onRetry={() => refetch()} />
    );
  }

  const handleDelete = () => {
    deleteMutation.mutate(quotation.id, {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        router.push('/sales/quotations');
      },
      onError: () => {
        setDeleteDialogOpen(false);
      },
    });
  };

  const handleUpdateStatus = () => {
    if (!nextStatus) return;

    updateStatusMutation.mutate(
      { status: nextStatus as any },
      {
        onSuccess: () => {
          setStatusDialogOpen(false);
          setNextStatus(null);
          refetch();
        },
        onError: () => {
          setStatusDialogOpen(false);
          setNextStatus(null);
        },
      },
    );
  };

  const handleConvert = () => {
    convertMutation.mutate({
      outletId: quotation.outletId,
      orderDate: convertData.orderDate ? new Date(convertData.orderDate).toISOString() : undefined,
      dueDate: convertData.dueDate ? new Date(convertData.dueDate).toISOString() : null,
      notes: convertData.notes || null
    }, {
      onSuccess: () => {
         setConvertDialogOpen(false);
      }
    });
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'accepted':
        return 'success';
      case 'rejected':
      case 'expired':
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
            onClick={() => router.push('/sales/quotations')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {quotation.quotationNumber}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{formatDateTime(quotation.createdAt)}</span>
              <span>•</span>
              <Badge variant={statusBadgeVariant(quotation.status) as any}>
                {t(`status.${quotation.status}`)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Print button */}
          <Button
            variant="outline"
            onClick={() =>
              window.open(`/sales/quotations/${quotation.id}/print`, '_blank')
            }
          >
            <Printer className="mr-2 h-4 w-4" /> {t('actions.printBtn')}
          </Button>

          {quotation.status === 'draft' && (
            <>
              <Button
                variant="outline"
                onClick={() =>
                  router.push(`/sales/quotations/${quotation.id}/edit`)
                }
              >
                <Edit className="mr-2 h-4 w-4" /> {t('actions.edit')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="mr-2 h-4 w-4" /> {t('actions.delete')}
              </Button>
              <Button
                onClick={() => {
                  setNextStatus('sent');
                  setStatusDialogOpen(true);
                }}
              >
                <Send className="mr-2 h-4 w-4" />{' '}
                {t('status.sent')}
              </Button>
            </>
          )}

          {quotation.status === 'sent' && (
            <>
              <Button
                variant="destructive"
                onClick={() => {
                  setNextStatus('rejected');
                  setStatusDialogOpen(true);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" /> {t('status.rejected')}
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setNextStatus('accepted');
                  setStatusDialogOpen(true);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> {t('status.accepted')}
              </Button>
            </>
          )}

          {quotation.status === 'accepted' && !quotation.convertedOrderId && (
             <Button
                onClick={() => setConvertDialogOpen(true)}
              >
                <FileBox className="mr-2 h-4 w-4" /> {t('convert.confirm')}
              </Button>
          )}
          
          {quotation.convertedOrderId && (
              <Button
                 variant="outline"
                 onClick={() => router.push(`/sales/orders/${quotation.convertedOrderId}`)}
               >
                 View Sales Order
               </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Section: Customer & Quotation Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('detail.customerInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <StoreIcon className="mt-1 h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <div className="font-medium">{quotation.customer?.name || '-'}</div>
                  {quotation.customer?.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{quotation.customer.address}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {quotation.customer?.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{quotation.customer.phone}</span>
                      </div>
                    )}
                    {quotation.customer?.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{quotation.customer.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('detail.otherInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('detail.otherInfo.quotationDate')}
                </span>
                <span className="font-medium">
                  {quotation.quotationDate ? formatDate(quotation.quotationDate) : '-'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {t('detail.otherInfo.validUntil')}
                </span>
                <span className="font-medium">
                  {quotation.validUntil ? formatDate(quotation.validUntil) : '-'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <StoreIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Outlet:
                </span>
                <span className="font-medium">
                  {quotation.outlet?.name}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Section: Items */}
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
                    {t('detail.items.total')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.items?.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">
                        {item.variant.product.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.variant.product.sku}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {Number(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.unitPrice))}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(Number(item.subtotal))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bottom Section: Notes & Totals */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
             <Card>
               <CardHeader>
                 <CardTitle>{t('detail.notes.title')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                   {quotation.notes || '-'}
                 </p>
               </CardContent>
             </Card>

             <Card>
               <CardHeader>
                 <CardTitle>{t('detail.terms.title')}</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                   {quotation.terms || '-'}
                 </p>
               </CardContent>
             </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('detail.paymentDetails.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{t('detail.paymentDetails.subtotal')}</span>
                <span>{formatCurrency(Number(quotation.subtotal))}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {t('detail.paymentDetails.discount')} ({Number(quotation.discountPercent)}%)
                </span>
                <span>- {formatCurrency(Number(quotation.discountAmount))}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {t('detail.paymentDetails.tax')} ({Number(quotation.taxPercent)}%)
                </span>
                <span>+ {formatCurrency(Number(quotation.taxAmount))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>{t('detail.paymentDetails.total')}</span>
                <span className="text-primary">{formatCurrency(Number(quotation.total))}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('detail.statusDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('detail.statusDialog.desc1')}
              <span className="font-bold uppercase">
                {t(`status.${nextStatus || 'draft'}`)}
              </span>
              {t('detail.statusDialog.desc2')}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        title={t('delete.title')}
        description={
          <>
            {t('delete.desc1')}
            <span className="font-semibold">{quotation?.quotationNumber}</span>
            {t('delete.desc2')}
          </>
        }
      />

      <Dialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('convert.title')}</DialogTitle>
            <DialogDescription>
              {t('convert.desc')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label htmlFor="orderDate">{t('convert.orderDate')}</Label>
               <Input 
                 id="orderDate" 
                 type="date" 
                 value={convertData.orderDate}
                 onChange={(e) => setConvertData({...convertData, orderDate: e.target.value})}
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="dueDate">{t('convert.dueDate')}</Label>
               <Input 
                 id="dueDate" 
                 type="date" 
                 value={convertData.dueDate}
                 onChange={(e) => setConvertData({...convertData, dueDate: e.target.value})}
               />
             </div>
             <div className="grid gap-2">
               <Label htmlFor="notes">{t('convert.notes')}</Label>
               <Textarea 
                 id="notes" 
                 value={convertData.notes}
                 onChange={(e) => setConvertData({...convertData, notes: e.target.value})}
                 placeholder="..."
               />
             </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setConvertDialogOpen(false)}>
               Cancel
             </Button>
             <Button onClick={handleConvert} disabled={convertMutation.isPending}>
               {convertMutation.isPending ? "Loading..." : t('convert.confirm')}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
