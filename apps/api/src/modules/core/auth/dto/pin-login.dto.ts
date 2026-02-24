import { createZodDto } from 'nestjs-zod';
import { pinLoginSchema } from '@bizflow/types';

export class PinLoginDto extends createZodDto(pinLoginSchema) {
  declare userId: string;
  declare pin: string;
}
