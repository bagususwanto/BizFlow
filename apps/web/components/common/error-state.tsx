import { Button } from '@bizflow/ui';
import { cn } from '@bizflow/ui/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string; // Allow custom styling/height
}

export function ErrorState({
  title = 'Gagal memuat data',
  message = 'Terjadi kesalahan saat mengambil data dari server.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex h-[50vh] flex-col items-center justify-center gap-4 text-center',
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-destructive">{title}</h3>
      <p className="text-muted-foreground">{message}</p>
      {onRetry && <Button onClick={onRetry}>Coba Lagi</Button>}
    </div>
  );
}
