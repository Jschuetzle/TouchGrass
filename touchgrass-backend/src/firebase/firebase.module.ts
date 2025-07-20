import { Global, Module } from '@nestjs/common';
import { initializeApp, applicationDefault, cert, App } from 'firebase-admin/app';
import { existsSync, readFileSync } from 'fs';
import { join , normalize } from 'path';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (): App => {
        const localServiceAccountPath = normalize(
          join(__dirname, '../..', 'secrets', 'touch-grass-fccf4-firebase-adminsdk-fbsvc-8e98c3ea1d.json')
        );

        if (existsSync(localServiceAccountPath)) {
          console.log('[Firebase] Using local service account for Firebase Admin');
          const serviceAccount = JSON.parse(readFileSync(localServiceAccountPath, 'utf8'));
          return initializeApp({
            credential: cert(serviceAccount),
          });
        }

        console.log('[Firebase] Using application default credentials');
        return initializeApp({
          credential: applicationDefault(),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
