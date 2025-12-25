import { Global, Module } from '@nestjs/common';
import { initializeApp, applicationDefault, App } from 'firebase-admin/app';
import { FIREBASE_PROVIDER_TOKEN } from '../common/constants/provider-tokens';

@Global()
@Module({
  providers: [
    {
      provide: FIREBASE_PROVIDER_TOKEN,
      useFactory: (): App => {
        return initializeApp({
          credential: applicationDefault(),
        });
      },
    },
  ],
  exports: [FIREBASE_PROVIDER_TOKEN],
})
export class FirebaseModule {}
