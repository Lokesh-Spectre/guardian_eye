// src\main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.useStaticAssets(join(__dirname, '..', 'photos')); // Serve images
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
