import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { OrmExceptionFilter } from './common/exception-filters/orm-exception.filter';
import { PatchExceptionFilter } from './common/exception-filters/patch-exception.filter';
import { UserDomainExceptionFilter } from './common/exception-filters/user-domain-exception.filter';
import * as bodyParser from 'body-parser';
import { RedisExceptionFilter } from './common/exception-filters/redis-exception.filter';
import { RekognitionExceptionFilter } from './common/exception-filters/rekognition-exception.filter';
import { CloudStorageExceptionFilter } from './common/exception-filters/cloud-storage-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    bodyParser.json({
      type: ['application/json', 'application/json-patch+json'],
    }),
  );

  app.enableCors({
    origin: '*',
    credentials: false,
  })

  app.useGlobalFilters(
    new OrmExceptionFilter(),
    new PatchExceptionFilter(),
    new UserDomainExceptionFilter(),
    new RedisExceptionFilter(),
    new RekognitionExceptionFilter(),
    new CloudStorageExceptionFilter(),
  );

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
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