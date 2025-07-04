import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS for Expo Web (browser-based frontend)
  app.enableCors({
    origin: ['localhost:8081'], // Add other domains as needed
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Enable if you're using cookies or auth headers
  });

  // ✅ Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

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