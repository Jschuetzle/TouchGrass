import { Global, Module } from '@nestjs/common';
import { initializeApp, applicationDefault, App } from 'firebase-admin/app';
import { FIREBASE_PROVIDER_TOKEN_NAME } from '../common/constants';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_PROVIDER_TOKEN_NAME,
      useFactory: (): App => {
        return initializeApp({
          credential: applicationDefault(),
        });
      },
    },
  ],
  exports: [FIREBASE_PROVIDER_TOKEN_NAME],
})
export class FirebaseModule {}
