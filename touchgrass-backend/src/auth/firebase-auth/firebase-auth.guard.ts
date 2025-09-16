import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
	Logger,
} from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { inspect } from 'util';
import { Request } from 'express';
import { FirebaseAuthService } from './firebase-auth.service';
import { AuthenticatedRequest } from '../../common/interfaces/authenticated-request.interface';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly authService: FirebaseAuthService) {}

	private readonly logger = new Logger(FirebaseAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
		this.logger.log(inspect(req.headers, { depth: 2, colors: true }));

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
			this.logger.log("Incoming Request missing Bearer keyword");
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const idToken = authHeader.replace('Bearer ', '');

    try {
      const decodedToken = await this.authService.verifyIdToken(idToken);
			this.logger.log(inspect(decodedToken, { depth: null, colors: true }));

      req.user = decodedToken;

      return true;
    } catch (error) {
			this.logger.log(`Error verifying decoded token: ${error}`);
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }
}
