import { Module } from '@nestjs/common';
import { FirebaseAuthService } from './firebase-auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseModule } from '../firebase.module';

@Module({
    imports: [FirebaseModule],
    providers: [FirebaseAuthService, FirebaseAuthGuard],
    exports: [FirebaseAuthService, FirebaseAuthGuard],
})
export class FirebaseAuthModule {}
