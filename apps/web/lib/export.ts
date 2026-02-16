/**
 * Excel Export Utility
 * Provides functions to export data to Excel format (.xlsx)
 */

import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
  width?: number;
}

/**
 * Get nested value from object using dot notation
 * Example: getNestedValue({user: {name: 'John'}}, 'user.name') => 'John'
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value === null || value === undefined) {
      return '';
    }
    value = value[key];
  }

  return value ?? '';
}

/**
 * Convert data array to Excel workbook
 */
export function convertToExcel(
  data: any[],
  columns: ExportColumn[],
  sheetName: string = 'Data',
): XLSX.WorkBook {
  // Create header row
  const headers = columns.map((col) => col.label);

  // Create data rows
  const rows = data.map((item) => {
    return columns.map((col) => {
      let value = getNestedValue(item, col.key);

      // Apply custom formatter if provided
      if (col.format && value !== null && value !== undefined) {
        value = col.format(value);
      }

      // Return raw value for Excel
      return value ?? '';
    });
  });

  // Combine headers and data
  const worksheetData = [headers, ...rows];

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths
  const columnWidths = columns.map((col) => ({
    wch:
      col.width ||
      Math.max(
        col.label.length,
        ...rows.map((row, idx) => {
          const cellValue = String(row[columns.indexOf(col)] || '');
          return cellValue.length;
        }),
      ) + 2,
  }));
  worksheet['!cols'] = columnWidths;

  // Style header row
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;

    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: 'E2E8F0' } },
      alignment: { horizontal: 'center', vertical: 'center' },
    };
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return workbook;
}

/**
 * Download Excel file
 */
export function downloadExcel(workbook: XLSX.WorkBook, filename: string): void {
  // Generate Excel file
  XLSX.writeFile(workbook, filename);
}

/**
 * Format date for Excel export
 */
export function formatDateForExport(
  date: string | Date | null | undefined,
): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  // Format: DD/MM/YYYY HH:mm:ss
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(d)
    .replace(',', '');
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  prefix: string,
  extension: string = 'xlsx',
): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${prefix}_${timestamp}.${extension}`;
}

/**
 * Export data to Excel (convenience function)
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  sheetName?: string,
): void {
  const workbook = convertToExcel(data, columns, sheetName);
  downloadExcel(workbook, filename);
}
