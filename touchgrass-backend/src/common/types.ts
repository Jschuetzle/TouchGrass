import { App } from "firebase-admin/app";
import { Auth } from "firebase-admin/auth";

export type FirebaseApplication = App;
export type FirebaseAuth = Auth;

export type JsonValue = 
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | { [key: string]: JsonValue };

export type JsonPointer = string;

// identical to the ValidationError type from class-validator lib...just wanted to make this lib-independent
export type ValidationErrorMetadata = {
    property: string;
    value: JsonValue;
    constraints?: {
        [type: string]: string;
    };
}