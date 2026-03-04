'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createStockAdjustmentSchema,
  CreateStockAdjustmentValues,
} from '@bizflow/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Combobox,
} from '@bizflow/ui';
import {
  Loader2,
  Save,
  Trash,
  Plus,
  ArrowRight,
  Search,
  CheckCircle,
} from 'lucide-react';
import {
  useCreateStockAdjustment,
  useGenerateAdjustmentNumber,
} from '@/hooks/use-stock-adjustments';
import { useWarehouses } from '@/hooks/use-warehouses';
import { useStocks } from '@/hooks/use-stock';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function StockAdjustmentForm() {
  const t = useTranslations('adjustments');
  const router = useRouter();
  const createMutation = useCreateStockAdjustment();

  const { warehouses = [], isLoading: isLoadingWarehouses } = useWarehouses({
    pageSize: 100,
  });

  type FormValues = CreateStockAdjustmentValues & { status?: string };

  const form = useForm<FormValues>({
    resolver: zodResolver(createStockAdjustmentSchema),
    defaultValues: {
      adjustmentNumber: '',
      warehouseId: '',
      type: 'correction' as const,
      reason: 'correction' as const,
      notes: '',
      status: 'draft',
      items: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const { data: generatedNumber, refetch: generateNumber } =
    useGenerateAdjustmentNumber();

  // Generate number on mount
  useEffect(() => {
    generateNumber().then((res) => {
      if (res.data) {
        form.setValue('adjustmentNumber', res.data);
      }
    });
  }, [form, generateNumber]);

  const selectedWarehouseId = form.watch('warehouseId');
  const adjustmentType = form.watch('type');

  // Search logic
  const [productSearch, setProductSearch] = useState('');
  const { data: stocksData, isLoading: isLoadingStocks } = useStocks({
    page: 1,
    pageSize: 20,
    search: productSearch,
    warehouseId: selectedWarehouseId || undefined,
  });

  // Watch for warehouse change to reset items
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name === 'warehouseId' && type === 'change') {
        replace([]);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, replace]);

  const onSubmit = (data: FormValues) => {
    // If saving as approval, status from the button click logic
    createMutation.mutate(data as CreateStockAdjustmentValues, {
      onSuccess: () => {
        router.push('/inventory/adjustments');
      },
    });
  };

  const handleAddItem = (stockItem: any) => {
    const exists = fields.find((f) => f.variantId === stockItem.variantId);
    if (exists) {
      toast.error('Item has already been added');
      return;
    }

    append({
      variantId: stockItem.variantId,
      adjustmentQty: 1,
      notes: '',
      // Store names temporarily to display in table without lookup later if we want, or do lookup
      // Since it's RHF we can't easily put custom non-schema fields without type errors unless we ignore.
    });
  };

  const typeOptions = [
    { value: 'increase', label: t('typeEnums.increase') },
    { value: 'decrease', label: t('typeEnums.decrease') },
    { value: 'correction', label: t('typeEnums.correction') },
  ];

  const reasonOptions = [
    { value: 'damaged', label: t('reasonEnums.damaged') },
    { value: 'expired', label: t('reasonEnums.expired') },
    { value: 'lost', label: t('reasonEnums.lost') },
    { value: 'theft', label: t('reasonEnums.theft') },
    { value: 'correction', label: t('reasonEnums.correction') },
    { value: 'other', label: t('reasonEnums.other') },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Main Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('create.headerTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('create.headerDesc')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="adjustmentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>
                      {t('create.form.numberLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('create.form.numberPlaceholder')}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="warehouseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>
                      {t('create.form.warehouseLabel')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select warehouse..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {warehouses.map((w: any) => (
                            <SelectItem key={w.id} value={w.id}>
                              {w.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('create.form.typeLabel')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {typeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>
                        {t('create.form.reasonLabel')}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {reasonOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>
                      {t('create.form.notesLabel')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('create.form.notesPlaceholder')}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Search Items Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t('create.itemsTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('create.itemsDesc')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedWarehouseId ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Select a warehouse first to see available stock.
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('create.form.searchProduct')}
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  {isLoadingStocks ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="rounded-md border h-[300px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>
                              {t('create.itemsTable.productName')}
                            </TableHead>
                            <TableHead className="text-right">
                              {t('create.itemsTable.systemQty')}
                            </TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stocksData?.data?.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={3}
                                className="h-24 text-center"
                              >
                                No items found in this warehouse.
                              </TableCell>
                            </TableRow>
                          ) : (
                            stocksData?.data?.map((stockItem) => {
                              const isAdded = fields.some(
                                (f) => f.variantId === stockItem.variantId,
                              );
                              return (
                                <TableRow key={stockItem.id}>
                                  <TableCell>
                                    <div className="font-medium">
                                      {stockItem.variant?.product?.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {stockItem.variant?.sku}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {Number(stockItem.quantity)}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      size="icon"
                                      variant="ghost"
                                      disabled={isAdded}
                                      onClick={() => handleAddItem(stockItem)}
                                    >
                                      {isAdded ? (
                                        <CheckCircle className="h-4 w-4 text-primary" />
                                      ) : (
                                        <Plus className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Selected Items Table */}
        <Card>
          <CardContent className="pt-6">
            {fields.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No items added yet. Search and add products from the list.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t('create.itemsTable.productName')}
                      </TableHead>
                      <TableHead className="w-[100px]">
                        {t('create.itemsTable.systemQty')}
                      </TableHead>
                      <TableHead className="w-[150px]">
                        {t('create.itemsTable.adjQty')}
                      </TableHead>
                      <TableHead className="w-[100px]">
                        {t('create.itemsTable.finalQty')}
                      </TableHead>
                      <TableHead className="w-[200px]">
                        {t('create.itemsTable.notes')}
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      // Find stock item context to show static data like name and system qty
                      const stockInfo = stocksData?.data?.find(
                        (s) => s.variantId === field.variantId,
                      );
                      const currentQty = form.watch(
                        `items.${index}.adjustmentQty`,
                      );
                      const systemQty = Number(stockInfo?.quantity || 0);
                      const finalQty = systemQty + (currentQty || 0);

                      return (
                        <TableRow key={field.id}>
                          <TableCell>
                            <div className="font-medium">
                              {stockInfo?.variant?.product?.name || 'Unknown'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {stockInfo?.variant?.sku || field.variantId}
                            </div>
                          </TableCell>
                          <TableCell>{systemQty}</TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.adjustmentQty`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(Number(e.target.value))
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {finalQty}
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`items.${index}.notes`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      placeholder="Notes..."
                                      {...field}
                                      value={field.value || ''}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
            {form.formState.errors.items && (
              <p className="mt-2 text-sm font-medium text-destructive">
                {form.formState.errors.items.message}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={createMutation.isPending || fields.length === 0}
            onClick={() => form.setValue('status', 'draft')}
          >
            {t('create.form.submitDraft')}
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || fields.length === 0}
            onClick={() => form.setValue('status', 'pending')}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Save className="mr-2 h-4 w-4" />
            {t('create.form.submitApproval')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
