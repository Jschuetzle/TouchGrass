import { IsIn, IsJSON, IsString, ValidateIf } from "class-validator";
import { JsonPointer, JsonValue } from "../types";

export class JsonPatchOp {
  @IsString()
  @IsIn(['add', 'remove', 'replace', 'move', 'copy', 'test'])
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';

  @IsString()
  path: JsonPointer;

  @ValidateIf(o => ['add', 'replace', 'test'].includes(o.op))
  @IsJSON()
  value?: JsonValue;

  @ValidateIf(o => ['copy', 'move'].includes(o.op))
  @IsString()
  from?: JsonPointer;
}