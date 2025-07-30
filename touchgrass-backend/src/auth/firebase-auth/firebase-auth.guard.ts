import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
	Logger,
} from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { App } from 'firebase-admin/app';
import { inspect } from 'util';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(@Inject('FIREBASE_ADMIN') private readonly firebaseApp: App) {}

	private readonly logger = new Logger(FirebaseAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
		// this.logger.log(inspect(req.headers, { depth: 2, colors: true }));

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
			this.logger.log("Incoming Request missing Bearer keyword");
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const idToken = authHeader.replace('Bearer ', '');

    try {
      const decodedToken = await getAuth(this.firebaseApp).verifyIdToken(idToken);
			// this.logger.log(inspect(decodedToken, { depth: null, colors: true }));
      req.user = decodedToken;
      return true;
    } catch (error) {
			this.logger.log(`Error verifying decoded token: ${error}`);
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }
}
