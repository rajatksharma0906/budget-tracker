import { Injectable } from '@nestjs/common';
import { query } from '../../lib/db/client';

@Injectable()
export class HealthService {
  /**
   * Ping MySQL with a simple query. Returns connection status.
   */
  async checkDb(): Promise<{ connected: boolean; error?: string }> {
    try {
      await query<{ ok: number }>('SELECT 1 AS ok');
      return { connected: true };
    } catch (e: any) {
      const message = e?.message ?? String(e);
      return { connected: false, error: message };
    }
  }
}
