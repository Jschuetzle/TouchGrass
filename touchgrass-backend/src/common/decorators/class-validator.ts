import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";

export function IsNotUndefined(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsNotUndefined',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return value !== undefined;
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} can't be undefined`;
                },
            },
        });
    };
}

export function IsImageMimeType(validationOptions?: ValidationOptions) {
    return function(object: Object, propertyName: string) {
        registerDecorator({
            name: 'IsImageMimeType',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return typeof value === 'string' && value.startsWith('image/');
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be an Image MIME type`;
                },
            },
        });
    }
}