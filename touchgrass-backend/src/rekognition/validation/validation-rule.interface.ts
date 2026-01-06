export interface ValidationRule<T> {
    name: string;
    validation_fn: (data: T) => boolean;
    err_code: number;
    err_msg: string;
}