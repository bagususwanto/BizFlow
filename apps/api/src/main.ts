import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ZodValidationPipe } from 'nestjs-zod';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from uploads directory
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  });

  // Global exception filters (order matters: more specific first)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 BizFlow API running on http://localhost:${port}/api/v1`);
}

void bootstrap();
