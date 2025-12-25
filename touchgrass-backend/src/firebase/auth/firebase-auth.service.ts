import { Inject, Injectable } from '@nestjs/common';
import { FIREBASE_PROVIDER_TOKEN } from '../../common/constants/provider-tokens';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { FirebaseApplication, FirebaseAuth } from '../../common/types';

@Injectable()
export class FirebaseAuthService {
    private readonly auth: FirebaseAuth;

    constructor(@Inject(FIREBASE_PROVIDER_TOKEN) private readonly firebaseApp: FirebaseApplication) {
        this.auth = getAuth(this.firebaseApp);
    };

    async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
        return this.auth.verifyIdToken(idToken);
    }
}
