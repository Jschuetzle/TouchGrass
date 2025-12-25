import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { User } from '../../user/domain/user.entity';

export type DashboardStatus = 'NEW_USER' | 'EXISTING_USER';

export class DashboardResponseDto {
  @ApiProperty({
    description: 'A status describing whether this is a first-time login for the user making the request.'
  })
  @IsString()
  status: DashboardStatus;

  @ApiProperty({
    description: 'All the data contents of the dashboard.'
  })
  data: User | Partial<User>;
}