import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateCompletedNewUserFlowResponseDto {
    @ApiProperty({
        required: true,
        description: 'Status of whether updates for all provided values were successful',
    })
    @IsBoolean()
    success: boolean;


    @ApiProperty({
        required: true,
        description: 'Flag that describes whether user is done creating their account',
    })
    @IsBoolean()
    completed_new_user_flow: boolean
}