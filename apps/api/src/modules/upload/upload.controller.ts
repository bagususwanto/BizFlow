import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from './upload.service';

@Controller('upload')
// TODO: Add back JwtAuthGuard and PermissionsGuard after fixing module resolution
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('product-image')
  // TODO: Add back @Permissions('products:update')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ filename: string; path: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const path = await this.uploadService.saveProductImage(file);

    return {
      filename: file.filename,
      path,
    };
  }
}
