import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@bizflow/ui';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS = [
  { key: 'F1', action: 'Bantuan Shortcut Display' },
  { key: 'F2', action: 'Fokus Cari Produk' },
  { key: 'F3', action: 'Pilih Pelanggan' },
  { key: 'F4', action: 'Bayar / Checkout' },
  { key: 'F9', action: 'Simpan Transaksi (Hold)' },
  { key: 'Esc', action: 'Batal / Tutup Modal' },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Shortcut Keyboard
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Tombol</th>
                  <th className="px-4 py-2 text-left font-medium">Aksi</th>
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
            Gunakan shortcut ini untuk mempercepat proses transaksi kasir.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
