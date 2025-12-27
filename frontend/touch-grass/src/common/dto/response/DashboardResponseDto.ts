import { DashboardStatus } from "@/common/constants/api";
import { UserResponseDto } from "./UserReponseDto";
import { Expose, Type } from "class-transformer";

export class DashboardResponseDto {
  @Expose()
  status: DashboardStatus;

  @Expose()
  @Type(() => UserResponseDto)
  data?: UserResponseDto;
}