import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Root health route (not affected by global prefix)
  const httpAdapter = app.getHttpAdapter();
  // @ts-ignore
  httpAdapter.getInstance().get('/', (_req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'inventory-monitoring-backend'
    });
  });
  
  // @ts-ignore
  httpAdapter.getInstance().get('/health', (_req, res) => {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'inventory-monitoring-backend'
    });
  });

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: configService.get('FRONTEND_URL', 'http://localhost:3000'),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global prefix, exclude health
  // @ts-ignore
  app.setGlobalPrefix('api', { exclude: ['health'] });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Monitoring Enterprise API')
    .setDescription('Enterprise-grade inventory monitoring and analytics system')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('inventory', 'Inventory management operations')
    .addTag('analytics', 'Analytics and reporting')
    .addTag('alerts', 'Alert management')
    .addTag('config', 'System configuration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start the application
  const port = configService.get('PORT', 3001);
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Inventory Monitoring Enterprise API running on port ${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}

bootstrap(); 