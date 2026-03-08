import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BillsModule } from './bills/bills.module';
import { SettingsModule } from './settings/settings.module';
import { SummaryModule } from './summary/summary.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';

@Module({
  controllers: [AppController],
  imports: [
    HealthModule,
    AuthModule,
    ProfileModule,
    ExpensesModule,
    BillsModule,
    SettingsModule,
    SummaryModule,
    ReportsModule,
    AdminModule,
  ],
})
export class AppModule {}
