import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ClassConstructor, instanceToPlain, plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";

@Injectable()
export class TransformEntityInterceptor<T> implements NestInterceptor<T | T[], any> {
    constructor(private readonly dtoClass: ClassConstructor<T>, private readonly expectsSingle = false) {}
    
    intercept(context: ExecutionContext, next: CallHandler<T | T[]>): Observable<any> {
        const req = context.switchToHttp().getRequest();
        
        return next.handle().pipe(
            map((data: T | T[]) => {
                let entities = Array.isArray(data) ? data : [data];

                if (this.expectsSingle && entities.length > 1) {
                    console.log(`ERROR ${req.method} ${req.route?.path}: Expected a single entity but received ${entities.length}`);
                    entities = [entities[0]]
                }

                const transformed = entities.map(entity => {
                    const plain = instanceToPlain(entity, { exposeUnsetFields: false });
                    return plainToInstance(this.dtoClass, plain, { excludeExtraneousValues: true });
                });

                return this.expectsSingle ? transformed[0] : transformed;
            })
        );
    }
}