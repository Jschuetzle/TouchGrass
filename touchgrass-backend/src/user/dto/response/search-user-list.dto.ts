import { Expose, Type } from "class-transformer";
import { SearchUserDto } from "./search-user.dto";
import { ApiProperty } from '@nestjs/swagger';
import { Search } from "@nestjs/common";

export class SearchUserResponseDto {
  @ApiProperty({ example: 23 })
  @Expose()
  total: number;

  @ApiProperty({ example: 1 })
  @Expose()
  page: number;

  @ApiProperty({ example: 10 })
  @Expose()
  limit: number;

  @ApiProperty({ type: [SearchUserDto] })
  @Expose()
  @Type(() => SearchUserDto)
  results: SearchUserDto[];
}

