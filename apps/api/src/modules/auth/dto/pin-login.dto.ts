import { createZodDto } from 'nestjs-zod';
import { pinLoginSchema } from '@bizflow/types/schemas';

export class PinLoginDto extends createZodDto(pinLoginSchema) {}
