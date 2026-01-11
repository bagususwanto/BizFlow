import { cn } from '@bizflow/ui/utils';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = 'Memuat data...',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex h-[50vh] flex-col items-center justify-center gap-2 text-center',
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}
