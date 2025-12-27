import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { User } from '../../user/domain/user.entity';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto/response/user.dto';

export const DASHBOARD_STATUSES = ['NEW_USER', 'EXISTING_USER'] as const;
export type DashboardStatus = typeof DASHBOARD_STATUSES[number];

export class DashboardResponseDto {
  @ApiProperty({
    description: 'A status describing whether this is a first-time login for the user making the request.'
  })
  @Expose()
  @IsString()
  @IsIn(DASHBOARD_STATUSES)
  status: DashboardStatus;

  @ApiProperty({
    description: 'All the data contents of the dashboard.'
  })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => UserResponseDto)
  data?: UserResponseDto;
}