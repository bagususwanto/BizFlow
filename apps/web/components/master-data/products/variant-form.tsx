import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createVariantSchema, CreateVariantValues } from '@bizflow/types';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Switch,
  FormDescription,
} from '@bizflow/ui';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import { useGenerateVariantSku } from '@/hooks/use-products';

interface VariantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateVariantValues) => void;
  initialData?: CreateVariantValues;
  isSubmitting?: boolean;
  productId: string;
}

export function VariantForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isSubmitting,
  productId,
}: VariantFormProps) {
  const generateSku = useGenerateVariantSku(productId);

  const form = useForm<CreateVariantValues>({
    resolver: zodResolver(createVariantSchema) as any,
    defaultValues: {
      sku: undefined,
      barcode: null,
      name: '',
      costPrice: 0,
      sellPrice: 0,
      isActive: true,
      attributes: {},
    },
  });

  const handleGenerateSku = async () => {
    try {
      const sku = await generateSku.mutateAsync();
      form.setValue('sku', sku);
    } catch (error) {
      console.error('Failed to generate SKU:', error);
    }
  };

  useEffect(() => {
    if (open && initialData) {
      form.reset(initialData);
    } else if (open) {
      form.reset({
        sku: undefined,
        barcode: null,
        name: '',
        costPrice: 0,
        sellPrice: 0,
        isActive: true,
        attributes: {},
      });
    }
  }, [open, initialData, form]);

  const handleSubmit = (data: CreateVariantValues) => {
    onSubmit(data);
  };

  // Convert attributes object to array for rendering
  const attributes = form.watch('attributes');
  const attributeEntries = Object.entries(attributes || {});

  const addAttribute = () => {
    const currentAttributes = form.getValues('attributes') || {};
    form.setValue('attributes', {
      ...currentAttributes,
      [`attr_${Object.keys(currentAttributes).length + 1}`]: '',
    });
  };

  const removeAttribute = (key: string) => {
    const currentAttributes = { ...form.getValues('attributes') };
    delete currentAttributes[key];
    form.setValue('attributes', currentAttributes);
  };

  const updateAttributeKey = (oldKey: string, newKey: string) => {
    if (oldKey === newKey) return;
    const currentAttributes = { ...form.getValues('attributes') };
    const value = currentAttributes[oldKey];
    delete currentAttributes[oldKey];
    currentAttributes[newKey] = value;
    form.setValue('attributes', currentAttributes);
  };

  const updateAttributeValue = (key: string, value: any) => {
    const currentAttributes = { ...form.getValues('attributes') };
    currentAttributes[key] = value;
    form.setValue('attributes', currentAttributes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Varian' : 'Tambah Varian Baru'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>SKU</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Kosongkan untuk auto-generate"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleGenerateSku}
                        title="Generate SKU Otomatis"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Akan otomatis dibuat jika dikosongkan
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel optional>Barcode</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="899..."
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
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel required>Nama Varian</FormLabel>
                    <FormControl>
                      <Input placeholder="Contoh: Merah, XL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Harga Beli</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Harga Jual</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-2">
                    <div className="space-y-0.5">
                      <FormLabel>Status Aktif</FormLabel>
                      <FormDescription>
                        Tentukan apakah varian ini aktif atau tidak.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Atribut Varian</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addAttribute}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Atribut
                </Button>
              </div>

              {attributeEntries.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4 border rounded-md border-dashed">
                  Belum ada atribut. Tambahkan atribut seperti Warna, Ukuran,
                  dll.
                </div>
              )}

              <div className="space-y-2">
                {attributeEntries.map(([key, value], index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        placeholder="Nama Atribut (mis: Warna)"
                        defaultValue={key}
                        onBlur={(e) => updateAttributeKey(key, e.target.value)}
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        placeholder="Nilai (mis: Merah)"
                        value={value as string}
                        onChange={(e) =>
                          updateAttributeValue(key, e.target.value)
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAttribute(key)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={form.handleSubmit(handleSubmit)}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
