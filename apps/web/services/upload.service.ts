import { useAuthStore } from '@/stores/auth.store';

export interface UploadResponse {
  filename: string;
  path: string;
}

class UploadService {
  async uploadProductImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const { accessToken } = useAuthStore.getState();
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

    const response = await fetch(`${API_BASE_URL}/upload/product-image`, {
      method: 'POST',
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
        // Do NOT set Content-Type header, let browser set it with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Gagal mengunggah gambar');
    }

    return response.json();
  }
}

export const uploadService = new UploadService();
