import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPriceLevelSchema,
  CreatePriceLevelValues,
  updatePriceLevelSchema,
} from '@bizflow/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
} from '@bizflow/ui';
import { useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useZodI18nResolver } from '@/hooks/use-zod-i18n-resolver';

interface PriceLevelFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreatePriceLevelValues) => Promise<void>;
  initialData?: CreatePriceLevelValues & { id?: string };
  isSubmitting: boolean;
  productId?: string;
  editingId?: string;
}

export function PriceLevelForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
  productId,
  editingId,
}: PriceLevelFormProps) {
  const t = useTranslations('priceLevels.form');
  const resolver = useZodI18nResolver(
    initialData ? updatePriceLevelSchema : createPriceLevelSchema,
  );

  const form = useForm<CreatePriceLevelValues>({
    resolver: resolver as any,
    defaultValues: {
      name: '',
      minQty: 1,
      price: 0,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          minQty: initialData.minQty,
          price: initialData.price,
        });
      } else {
        form.reset({
          name: '',
          minQty: 1,
          price: 0,
        });
      }
    }
  }, [open, initialData, form]);

  const handleSubmit = async (data: CreatePriceLevelValues) => {
    await onSubmit(data);
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? t('editTitle') : t('addTitle')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t('nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('minQtyLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t('priceLabel')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {!isSubmitting && <Save className="mr-2 h-4 w-4" />}
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
