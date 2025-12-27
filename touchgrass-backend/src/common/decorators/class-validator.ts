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