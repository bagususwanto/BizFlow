import { createZodDto } from 'nestjs-zod';
import { queryUsersSchema } from '@bizflow/types';

export class QueryUsersDto extends createZodDto(queryUsersSchema) {}
