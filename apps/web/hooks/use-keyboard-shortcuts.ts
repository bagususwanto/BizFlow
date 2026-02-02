import { useEffect } from 'react';

interface ShortcutHandlers {
  onSearchFocus?: () => void;
  onCustomerClick?: () => void;
  onPayment?: () => void;
  onHold?: () => void;
  onCancel?: () => void;
  onHelp?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F-keys should work globally (even if input is focused)
      // Escape might need care if we are in a modal, but for now let's trigger handler

      switch (e.key) {
        case 'F1':
          e.preventDefault();
          if (handlers.onHelp) handlers.onHelp();
          break;
        case 'F2':
          e.preventDefault();
          if (handlers.onSearchFocus) handlers.onSearchFocus();
          break;
        case 'F3':
          e.preventDefault();
          if (handlers.onCustomerClick) handlers.onCustomerClick();
          break;
        case 'F4':
          e.preventDefault();
          if (handlers.onPayment) handlers.onPayment();
          break;
        case 'F9':
          e.preventDefault();
          if (handlers.onHold) handlers.onHold();
          break;
        case 'Escape':
          // We don't preventDefault here to allow native modal closing etc if handled elsewhere,
          // but if we want to clear search explicitly:
          if (handlers.onCancel) handlers.onCancel();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}
