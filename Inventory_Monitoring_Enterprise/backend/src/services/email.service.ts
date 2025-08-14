import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailAlert {
  type: 'low_stock' | 'critical_stock' | 'reorder' | 'daily_digest';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  items?: any[];
  summary?: any;
  recipient?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    };

    this.transporter = nodemailer.createTransporter(smtpConfig);
  }

  async sendAlertEmail(alert: EmailAlert): Promise<boolean> {
    try {
      const template = this.getEmailTemplate(alert.type);
      const html = template(alert);

      const mailOptions = {
        from: this.configService.get('SMTP_USER'),
        to: alert.recipient || this.configService.get('ALERT_RECIPIENTS', 'admin@danier.com'),
        subject: `[Inventory Alert] ${alert.title}`,
        html: html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Alert email sent successfully: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send alert email: ${error.message}`);
      return false;
    }
  }

  async sendDailyDigest(summary: any): Promise<boolean> {
    try {
      const alert: EmailAlert = {
        type: 'daily_digest',
        severity: 'info',
        title: 'Daily Inventory Digest',
        message: 'Your daily inventory summary is ready',
        summary: summary,
      };

      return await this.sendAlertEmail(alert);
    } catch (error) {
      this.logger.error(`Failed to send daily digest: ${error.message}`);
      return false;
    }
  }

  private getEmailTemplate(type: string): handlebars.TemplateDelegate {
    const templatePath = path.join(__dirname, '../templates', `${type}.hbs`);
    
    if (fs.existsSync(templatePath)) {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateContent);
    }

    // Default template
    return handlebars.compile(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .alert { padding: 15px; margin: 10px 0; border-radius: 5px; }
          .critical { background-color: #ffebee; border-left: 4px solid #f44336; }
          .warning { background-color: #fff3e0; border-left: 4px solid #ff9800; }
          .info { background-color: #e3f2fd; border-left: 4px solid #2196f3; }
          .item { margin: 10px 0; padding: 10px; background-color: #f5f5f5; }
          .summary { margin: 20px 0; }
        </style>
      </head>
      <body>
        <h2>{{title}}</h2>
        <div class="alert {{severity}}">
          <p>{{message}}</p>
        </div>
        {{#if items}}
          <h3>Affected Items:</h3>
          {{#each items}}
            <div class="item">
              <strong>{{style}} {{variant_code}}</strong><br>
              Current Stock: {{total_quantity}} units<br>
              Price: ${{selling_price}}
            </div>
          {{/each}}
        {{/if}}
        {{#if summary}}
          <div class="summary">
            <h3>Summary:</h3>
            <p>Total Items: {{summary.total_items}}</p>
            <p>Total Value: ${{summary.total_value}}</p>
            <p>Alerts Generated: {{summary.total_alerts}}</p>
          </div>
        {{/if}}
      </body>
      </html>
    `);
  }
} 