import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
    constructor(private readonly dtoClass: ClassConstructor<T>) {}
    
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(entity => {
                const plain = instanceToPlain(entity, { exposeUnsetFields: false });
                return plainToInstance(this.dtoClass, plain, { excludeExtraneousValues: true });
            })
        );
    }
}