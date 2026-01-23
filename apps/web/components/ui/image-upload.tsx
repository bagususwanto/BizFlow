'use client';

import { useState } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@bizflow/ui';
import { cn } from '@/lib/utils';
import { uploadService } from '@/services/upload.service';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  disabled,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.type,
    );
    if (!isValidType) {
      toast.error('Format file tidak didukung (harus JPG, PNG, atau WEBP)');
      return;
    }

    const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
    if (!isValidSize) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadService.uploadProductImage(file);
      onChange(response.path); // Save relative path
      toast.success('Poto produk berhasil diunggah');
    } catch (error) {
      toast.error('Gagal mengunggah foto');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Construct full URL if value is relative path
  const imageUrl = value
    ? value.startsWith('http')
      ? value
      : `${API_URL}/uploads/${value}`
    : null;

  return (
    <div className="flex items-center gap-4">
      {imageUrl ? (
        <div className="relative h-40 w-40 overflow-hidden rounded-md border">
          <div className="absolute right-1 top-1 z-10">
            <Button
              type="button"
              onClick={onRemove}
              variant="destructive"
              size="icon"
              className="h-6 w-6"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Image
            src={imageUrl}
            alt="Product Image"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 w-40 items-center justify-center rounded-md border border-dashed bg-muted/50">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 p-4 hover:opacity-75">
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {isUploading ? 'Mengunggah...' : 'Upload Foto'}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={onUpload}
              disabled={disabled || isUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
}
