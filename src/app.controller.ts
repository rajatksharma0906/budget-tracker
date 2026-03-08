import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health/health.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly healthService: HealthService) {}

  @Get('health')
  @ApiOperation({ summary: 'App liveness (no DB)' })
  health() {
    return { ok: true, app: 'ok' };
  }

  @Get('health/db')
  @ApiOperation({ summary: 'App + MySQL connection check' })
  async healthDb() {
    const db = await this.healthService.checkDb();
    const ok = db.connected;
    return {
      ok,
      app: 'ok',
      mysql: db.connected ? 'connected' : 'error',
      ...(db.error && { error: db.error }),
    };
  }
}
