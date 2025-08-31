import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DashboardController } from './dashboard.controller';

@Module({
    imports: [UserModule],
    controllers: [DashboardController]
})
export class DashboardModule {}
