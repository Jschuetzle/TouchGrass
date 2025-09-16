import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Module({
    providers: [FirebaseAuthService, FirebaseAuthGuard],
    exports: [FirebaseAuthGuard],
})
export class FirebaseAuthModule {}
