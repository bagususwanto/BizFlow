import { createZodDto } from 'nestjs-zod';
import { refreshTokenSchema } from '@bizflow/types';

export class RefreshTokenDto extends createZodDto(refreshTokenSchema) {}
