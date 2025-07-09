import { Global, Module } from '@nestjs/common';
import { initializeApp, applicationDefault, App } from 'firebase-admin/app';

@Global()
@Module({
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: (): App => {
        return initializeApp({
          credential: applicationDefault(),
        });
      },
    },
  ],
  exports: ['FIREBASE_ADMIN'],
})
export class FirebaseModule {}
