import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildSearchParams(
  params: Record<string, any>,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (!params) return searchParams;

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;

  // Assuming API is on localhost:3000 by default for dev
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

  // If API_URL contains /api/v*, strip it to get the base origin
  // This assumes static assets are served from the root, not under /api/v1
  const baseUrl = apiUrl.replace(/\/api\/v\d+$/, '');

  // Ensure path doesn't start with slash if we're appending to /uploads/
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${baseUrl}/uploads/${cleanPath}`;
}
