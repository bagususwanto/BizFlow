import { useEffect, useRef } from 'react';

interface UseBarcodeScannerProps {
  onScan: (barcode: string) => void;
  minLength?: number;
  timeThreshold?: number; // Time in ms between keystrokes to consider it part of a scan
}

export function useBarcodeScanner({
  onScan,
  minLength = 8,
  timeThreshold = 50,
}: UseBarcodeScannerProps) {
  // Use a ref to hold the barcode being scanned to avoid closure staleness
  const barcodeBuffer = useRef<string>('');
  const lastKeyTime = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea (optional, but usually desired)
      // BUT for "Scan to fill", if we are focused on the barcode input, we just let normal input handling work.
      // This hook is for "global" scanning or when not focused on a specific field.
      // Or maybe we want to intercept even if focused? Usually scanners act as keyboard.
      // If we are in a specific input, we might not want to intercept.
      const target = event.target as HTMLElement;
      if (
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        !(target as any).dataset.scannerInput // Optional: allow specific inputs to be overridden
      ) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime.current;

      // If time difference is too large, reset buffer (it's likely manual typing)
      if (timeDiff > timeThreshold && barcodeBuffer.current.length > 0) {
        barcodeBuffer.current = '';
      }

      lastKeyTime.current = currentTime;

      // Handle Enter key (end of scan)
      if (event.key === 'Enter') {
        if (barcodeBuffer.current.length >= minLength) {
          event.preventDefault(); // Prevent default enter behavior (like form submission)
          onScan(barcodeBuffer.current);
          barcodeBuffer.current = '';
        }
        return;
      }

      // Allow alphanumeric characters
      if (event.key.length === 1) {
        barcodeBuffer.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onScan, minLength, timeThreshold]);
}
