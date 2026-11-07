import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get()
  async check() {
    // Database connection check
    const isDbConnected = this.dataSource.isInitialized;

    return {
      status: 'ok',
      message: 'RentEase API is running smoothly',
      database: isDbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }
}