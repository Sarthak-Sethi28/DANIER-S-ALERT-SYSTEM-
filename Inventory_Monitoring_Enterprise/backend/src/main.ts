import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get('FRONTEND_URL') || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Monitoring Enterprise API')
    .setDescription('Professional inventory management and monitoring system')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('inventory', 'Inventory management endpoints')
    .addTag('alerts', 'Alert management endpoints')
    .addTag('analytics', 'Analytics and reporting endpoints')
    .addTag('auth', 'Authentication endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Inventory Monitoring Enterprise API running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
  console.log(`🔗 Health check available at http://localhost:${port}/api/v1/health`);
}

bootstrap(); 