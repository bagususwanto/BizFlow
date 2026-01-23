import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly uploadsDir = join(process.cwd(), 'uploads', 'products');

  /**
   * Save uploaded file and return relative path
   */
  async saveProductImage(file: Express.Multer.File): Promise<string> {
    const filename = `${uuidv4()}${this.getFileExtension(file.originalname)}`;
    const relativePath = `products/${filename}`;

    return relativePath;
  }

  /**
   * Delete product image from disk
   */
  async deleteProductImage(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    try {
      // Extract filename from URL (e.g., "products/abc123.jpg" -> "abc123.jpg")
      const filename = imageUrl.split('/').pop();
      if (!filename) return;

      const filePath = join(this.uploadsDir, filename);
      await unlink(filePath);
    } catch (error) {
      // Log error but don't throw - file might already be deleted
      console.warn(`Failed to delete image: ${imageUrl}`, error);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const ext = filename.split('.').pop();
    return ext ? `.${ext}` : '';
  }
}
