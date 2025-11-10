import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class UpdateCompletedNewUserFlowRequestDto {
    @ApiProperty({
        description: "Status indicating whether the current user has completed the new user workflow",
    })
    @IsBoolean()
    completed_new_user_flow: boolean;
}