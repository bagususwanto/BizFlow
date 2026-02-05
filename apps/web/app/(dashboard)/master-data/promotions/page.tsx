import { Button } from '@bizflow/ui';
import { Plus } from 'lucide-react';

export default function PromotionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Promosi</h1>
          <p className="text-muted-foreground">
            Kelola promo dan diskon otomatis untuk POS
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Buat Promo
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/10">
        <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🎉</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">Fitur Promo Segera Hadir</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          Halaman ini nantinya akan digunakan untuk mengelola promo otomatis
          seperti diskon persen, nominal, dan buy X get Y yang akan otomatis
          diaplikasikan di POS.
        </p>
        <p className="text-sm text-muted-foreground">
          Backend API sudah siap digunakan.
        </p>
      </div>
    </div>
  );
}
