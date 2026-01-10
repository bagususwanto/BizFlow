# Hardware Integration

## Thermal Printer

```typescript
// services/printer.service.ts
interface PrinterConfig {
  type: "usb" | "network" | "bluetooth";
  width: 58 | 80; // mm
  address?: string; // IP for network printer
  deviceId?: string; // USB device ID
}

interface ReceiptData {
  header: {
    companyName: string;
    address: string;
    phone: string;
    taxId?: string;
  };
  transaction: {
    orderNumber: string;
    date: Date;
    cashier: string;
    items: {
      name: string;
      qty: number;
      price: number;
      subtotal: number;
    }[];
    subtotal: number;
    discount?: number;
    tax?: number;
    total: number;
    payments: {
      method: string;
      amount: number;
    }[];
    change?: number;
  };
  footer: {
    message?: string;
    thankYou: string;
  };
}

class PrinterService {
  async printReceipt(data: ReceiptData): Promise<void> {
    const escpos = this.buildEscPos(data);
    await this.send(escpos);
  }

  async openCashDrawer(): Promise<void> {
    // ESC/POS command to open cash drawer
    await this.send(Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]));
  }

  private buildEscPos(data: ReceiptData): Buffer {
    // Build ESC/POS commands for receipt
    // ...
  }
}
```

---

## Barcode Scanner

```typescript
// hooks/use-barcode-scanner.ts
interface ScannerConfig {
  prefix?: string; // Scanner prefix character
  suffix?: string; // Scanner suffix (usually Enter)
  timeout?: number; // Multi-char timeout (ms)
}

function useBarcodeScanner(
  onScan: (barcode: string) => void,
  config: ScannerConfig = {}
) {
  const { prefix = "", suffix = "\n", timeout = 50 } = config;
  const bufferRef = useRef("");
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input is focused
      if (e.target instanceof HTMLInputElement) return;

      clearTimeout(timeoutRef.current);

      if (e.key === "Enter") {
        if (bufferRef.current.length > 3) {
          onScan(bufferRef.current);
        }
        bufferRef.current = "";
        return;
      }

      bufferRef.current += e.key;

      timeoutRef.current = setTimeout(() => {
        bufferRef.current = "";
      }, timeout);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan, timeout]);
}
```

---

## Supported Hardware

| Device               | Connection         | Support               |
| -------------------- | ------------------ | --------------------- |
| Thermal Printer 58mm | USB, Bluetooth     | ESC/POS commands      |
| Thermal Printer 80mm | USB, Network       | ESC/POS commands      |
| Cash Drawer          | Printer-triggered  | ESC/POS pulse command |
| Barcode Scanner      | USB HID, Bluetooth | Keyboard emulation    |
