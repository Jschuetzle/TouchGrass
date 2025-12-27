import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";

@Injectable()
export class TransformEntityInterceptor<T> implements NestInterceptor<T | T[], any> {
    constructor(private readonly dtoClass: ClassConstructor<T>) {}
    
    intercept(context: ExecutionContext, next: CallHandler<T | T[]>): Observable<any> {
        return next.handle().pipe(
            map((data: T | T[]) => {
                let entities = Array.isArray(data) ? data : [data];

                const transformed = entities.map(entity => {
                    const plain = instanceToPlain(entity, { exposeUnsetFields: false });
                    return plainToInstance(this.dtoClass, plain, { excludeExtraneousValues: true });
                });

                return transformed.length === 1 ? transformed[0] : transformed;
            })
        );
    }
}