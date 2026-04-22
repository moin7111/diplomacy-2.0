import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  private redisClient: Redis;

  constructor(private readonly prisma: PrismaService) {
    this.redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');
  }

  @Get()
  async checkHealth() {
    let dbStatus = 'disconnected';
    let redisStatus = 'disconnected';

    // Check PostgreSQL
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e) {
      dbStatus = 'error';
    }

    // Check Redis
    try {
      const ping = await this.redisClient.ping();
      if (ping === 'PONG') {
        redisStatus = 'connected';
      }
    } catch (e) {
      redisStatus = 'error';
    }

    return {
      status: dbStatus === 'connected' && redisStatus === 'connected' ? 'ok' : 'error',
      db: dbStatus,
      redis: redisStatus,
      uptime: process.uptime(),
    };
  }
}
