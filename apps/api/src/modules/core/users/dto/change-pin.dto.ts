import { createZodDto } from 'nestjs-zod';
import { changePinSchema } from '@bizflow/types';

export class ChangePinDto extends createZodDto(changePinSchema) {}
