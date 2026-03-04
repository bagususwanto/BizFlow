import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@bizflow/ui';
import { Keyboard } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const t = useTranslations('pos.keyboardShortcuts');

  const SHORTCUTS = [
    { key: 'F1', action: t('actions.help') },
    { key: 'F2', action: t('actions.focusSearch') },
    { key: 'F3', action: t('actions.selectCustomer') },
    { key: 'F4', action: t('actions.checkout') },
    { key: 'F9', action: t('actions.hold') },
    { key: 'Esc', action: t('actions.cancel') },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {t('title')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">
                    {t('keyHeader')}
                  </th>
                  <th className="px-4 py-2 text-left font-medium">
                    {t('actionHeader')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {SHORTCUTS.map((shortcut) => (
                  <tr
                    key={shortcut.key}
                    className="border-b last:border-0 hover:bg-muted/50"
                  >
                    <td className="px-4 py-2 font-mono font-bold text-primary">
                      <span className="rounded-md bg-muted px-2 py-1 border shadow-sm text-xs">
                        {shortcut.key}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {shortcut.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {t('description')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
