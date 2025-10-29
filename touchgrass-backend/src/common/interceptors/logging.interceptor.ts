import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    console.log(`[Request] ${method} ${url}`);

    return next.handle().pipe(
      map((responseBody) => {
        // Log response
        console.log(`[Response] ${method} ${url} | Response Body: ${JSON.stringify(responseBody)}`);
        return responseBody; // must return response unchanged
      }),
    );
  }
}
