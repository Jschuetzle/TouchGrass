export type JsonValue = 
    | null
    | boolean
    | number
    | string
    | JsonValue[]
    | { [key: string]: JsonValue };

export type JsonPointer = string;