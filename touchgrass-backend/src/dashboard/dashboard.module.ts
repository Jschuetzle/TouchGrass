import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { DashboardController } from './dashboard.controller';
import { FirebaseAuthModule } from '../firebase/auth/firebase-auth.module';

@Module({
    imports: [UserModule, FirebaseAuthModule],
    controllers: [DashboardController]
})
export class DashboardModule {}
