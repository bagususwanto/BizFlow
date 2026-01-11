import { createZodDto } from 'nestjs-zod';
import { refreshTokenSchema } from '@bizflow/types/schemas';

export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
