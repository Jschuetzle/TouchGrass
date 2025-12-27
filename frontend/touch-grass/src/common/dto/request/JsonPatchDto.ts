import { JsonPointer, JsonValue } from "@/common/types/common";

type JsonPatchOp = 
    | {
        op: 'add' | 'replace' | 'test';
        path: JsonPointer;
        value: JsonValue;
      }
    | {
        op: 'copy' | 'move',
        from: JsonPointer;
        path: JsonPointer;
      }
    | {
        op: 'remove';
        path: JsonPointer;
    };

export type JsonPatchDto = JsonPatchOp[];