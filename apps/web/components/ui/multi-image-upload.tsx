'use client';

import { useState } from 'react';
import { ImagePlus, X, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@bizflow/ui';
import { cn, getImageUrl } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';

interface MultiImageUploadProps {
  values?: string[];
  onChange: (values: string[]) => void;
  onRemove: (value: string) => void;
  disabled?: boolean;
  maxImages?: number;
}

export function MultiImageUpload({
  values = [],
  onChange,
  onRemove,
  disabled,
  maxImages = 5,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max images
    if (values.length + files.length > maxImages) {
      toast.error(`Maksimal ${maxImages} gambar`);
      return;
    }

    try {
      setIsUploading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files.item(i);
        if (!file) continue;

        // Validation
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(
          file.type,
        );
        if (!isValidType) {
          toast.error(
            `File ${file.name} tidak didukung (harus JPG, PNG, atau WEBP)`,
          );
          continue;
        }

        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidSize) {
          toast.error(`Ukuran file ${file.name} maksimal 5MB`);
          continue;
        }

        const response = await uploadService.uploadProductImage(file);
        newUrls.push(response.path);
      }

      if (newUrls.length > 0) {
        onChange([...values, ...newUrls]);
        toast.success(`${newUrls.length} foto berhasil diunggah`);
      }
    } catch (error) {
      toast.error('Gagal mengunggah foto');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {values.map((url, index) => {
          const imageUrl = getImageUrl(url);
          return (
            <div
              key={index}
              className="relative h-40 w-40 overflow-hidden rounded-md border"
            >
              <div className="absolute right-1 top-1 z-10">
                <Button
                  type="button"
                  onClick={() => onRemove(url)}
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl || undefined}
                alt={`Product Image ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          );
        })}

        {values.length < maxImages && (
          <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed bg-muted/50">
            <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 hover:opacity-75">
              {isUploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
              )}
              <div className="text-center">
                <span className="text-xs font-semibold text-muted-foreground">
                  {isUploading ? 'Mengunggah...' : 'Upload Foto'}
                </span>
                <p className="px-2 text-[10px] text-muted-foreground mt-1">
                  Max {maxImages} gambar
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onUpload}
                disabled={disabled || isUploading}
              />
            </label>
          </div>
        )}
      </div>
      {values.length > 0 && (
        <p className="text-xs text-muted-foreground">
          * Foto pertama akan menjadi foto utama produk
        </p>
      )}
    </div>
  );
}
