import { Expose, Type } from "class-transformer";
import { SearchUserDto } from "@/common/dto/response/SearchUserDto";

export class SearchUserResponseDto {
  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  @Type(() => SearchUserDto)
  results!: SearchUserDto[];
}
