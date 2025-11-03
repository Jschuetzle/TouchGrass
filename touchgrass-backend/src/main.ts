import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json({ limit: '15mb' }));

  app.enableCors({
    origin: '*',
    credentials: false,
  })

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor())

  // ✅ Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('TouchGrass API')
    .setDescription('API documentation for the TouchGrass app')
    .setVersion('1.0')
    .addBearerAuth() // Include if you're using JWT auth
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Docs available at /api

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();