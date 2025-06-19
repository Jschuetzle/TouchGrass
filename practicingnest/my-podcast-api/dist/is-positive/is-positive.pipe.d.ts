import { ArgumentMetadata, PipeTransform } from '@nestjs/common';
export declare class IsPositivePipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
}
