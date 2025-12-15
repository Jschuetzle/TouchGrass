import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const FirebaseUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user;
  },
);
