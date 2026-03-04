'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@bizflow/ui';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cart.store';
import { Percent, DollarSign, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DiscountDialog({ open, onOpenChange }: DiscountDialogProps) {
  const { discount, setDiscount, getSubtotal } = useCartStore();
  const t = useTranslations('pos.discountDialog');

  const [activeTab, setActiveTab] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');

  // Sync state when opening
  useEffect(() => {
    if (open) {
      if (discount) {
        setActiveTab(discount.type);
        setValue(discount.value.toString());
      } else {
        setActiveTab('percent');
        setValue('');
      }
    }
  }, [open, discount]);

  const handleSave = () => {
    const numValue = parseFloat(value);

    if (isNaN(numValue) || numValue < 0) {
      toast.error(t('invalidValue'));
      return;
    }

    if (activeTab === 'percent') {
      if (numValue > 100) {
        toast.error(t('over100'));
        return;
      }
    } else {
      const subtotal = getSubtotal();
      if (numValue > subtotal) {
        toast.error(t('overSubtotal'));
        return;
      }
    }

    setDiscount({
      type: activeTab,
      value: numValue,
    });
    onOpenChange(false);
    toast.success(t('applied'));
  };

  const handleRemove = () => {
    setDiscount(null);
    onOpenChange(false);
    toast.success(t('removed'));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'percent' | 'fixed')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="percent">{t('percent')}</TabsTrigger>
            <TabsTrigger value="fixed">{t('fixed')}</TabsTrigger>
          </TabsList>

          <div className="py-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                {activeTab === 'percent' ? (
                  <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                ) : (
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">
                    Rp
                  </span>
                )}
                <Input
                  type="number"
                  placeholder={
                    activeTab === 'percent'
                      ? t('percentPlaceholder')
                      : t('fixedPlaceholder')
                  }
                  className={activeTab === 'percent' ? 'pl-9' : 'pl-10'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                  }}
                  autoFocus
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              {activeTab === 'percent' ? t('percentDesc') : t('fixedDesc')}
            </p>
          </div>
        </Tabs>

        <DialogFooter className="gap-2 sm:gap-0">
          {discount && (
            <Button
              type="button"
              variant="destructive"
              className="mr-auto"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
