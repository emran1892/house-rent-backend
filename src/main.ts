import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. All API routes will be prefixed with 'api/v1'
  app.setGlobalPrefix('api/v1');

  // 2. Input sanitization and validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO-automatic validation: only properties defined in the DTO will be accepted
      forbidNonWhitelisted: true, // If an invalid field is sent, it will return an error immediately
      transform: true, // It will automatically transform the input data to the specified type
    }),
  );

  // 3. Swagger API documentation configuration
  const config = new DocumentBuilder()
    .setTitle('RentEase API')
    .setDescription('Multi-tenant House Rent Management Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const PORT = process.env.PORT || 4000;
  await app.listen(PORT);
  console.log(`🚀 RentEase API Running: http://localhost:${PORT}/api/v1/health`);
  console.log(`📑 Swagger Documentation: http://localhost:${PORT}/api/docs`);
}
bootstrap();