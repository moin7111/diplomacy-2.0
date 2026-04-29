import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const winstonConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    // Console Transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, trace }) => {
          return `${timestamp} [${context || 'App'}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
        }),
      ),
    }),
    // File Transport with Daily Rotation
    new winston.transports.DailyRotateFile({
      filename: 'logs/app-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '7d', // Keep logs for 7 days
      maxSize: '10m', // Max 10 MB per file
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ],
};
