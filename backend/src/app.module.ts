import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ThrottlerModule } from '@nestjs/throttler';

// Controllers
import { HealthController } from './controllers/health.controller';
import { InventoryController } from './controllers/inventory.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { AlertsController } from './controllers/alerts.controller';
import { ConfigController } from './controllers/config.controller';

// Services
import { InventoryService } from './services/inventory.service';
import { AnalyticsService } from './services/analytics.service';
import { AlertService } from './services/alert.service';
import { ConfigService as AppConfigService } from './services/config.service';
import { EmailService } from './services/email.service';
import { SchedulerService } from './services/scheduler.service';

// Entities
import { InventoryState } from './entities/inventory-state.entity';
import { SalesHistory } from './entities/sales-history.entity';
import { SkuCategories } from './entities/sku-categories.entity';
import { TierConfig } from './entities/tier-config.entity';
import { ReorderEvents } from './entities/reorder-events.entity';
import { TierChanges } from './entities/tier-changes.entity';
import { AlertHistory } from './entities/alert-history.entity';
import { SystemSettings } from './entities/system-settings.entity';
import { ProcessingLogs } from './entities/processing-logs.entity';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST', 'localhost'),
        port: configService.get('DATABASE_PORT', 5432),
        username: configService.get('DATABASE_USER', 'inventory_user'),
        password: configService.get('DATABASE_PASSWORD', 'inventory_pass'),
        database: configService.get('DATABASE_NAME', 'inventory_enterprise'),
        entities: [
          InventoryState,
          SalesHistory,
          SkuCategories,
          TierConfig,
          ReorderEvents,
          TierChanges,
          AlertHistory,
          SystemSettings,
          ProcessingLogs,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        retryAttempts: 10,
        retryDelay: 3000,
        keepConnectionAlive: true,
      }),
      inject: [ConfigService],
    }),

    // TypeORM entities
    TypeOrmModule.forFeature([
      InventoryState,
      SalesHistory,
      SkuCategories,
      TierConfig,
      ReorderEvents,
      TierChanges,
      AlertHistory,
      SystemSettings,
      ProcessingLogs,
    ]),

    // Scheduling
    ScheduleModule.forRoot(),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get('THROTTLE_TTL', 60),
          limit: configService.get('THROTTLE_LIMIT', 100),
        }],
      }),
      inject: [ConfigService],
    }),

    // Email
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('SMTP_HOST', 'smtp.gmail.com'),
          port: configService.get('SMTP_PORT', 587),
          secure: false,
          auth: {
            user: configService.get('SMTP_USER', 'alerts@yourcompany.com'),
            pass: configService.get('SMTP_PASS', ''),
          },
        },
        defaults: {
          from: `"Inventory Monitoring" <${configService.get('SMTP_USER', 'alerts@yourcompany.com')}>`,
        },
        template: {
          dir: __dirname + '/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    HealthController,
    InventoryController,
    AnalyticsController,
    AlertsController,
    ConfigController,
  ],
  providers: [
    InventoryService,
    AnalyticsService,
    AlertService,
    AppConfigService,
    EmailService,
    SchedulerService,
  ],
})
export class AppModule {} 