import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../firebase/auth/firebase-auth.guard';
import { FirebaseUser } from '../firebase/auth/firebase-user.decorator';
import { UserService } from '../user/user.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UserResponseDto } from 'src/user/dto/response/user.dto';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
    constructor(private userService: UserService) {}
    
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Load in the dashboard--currently an output of all users' })
    @ApiResponse({ status: 200, description: 'List of all users' })
    @UseGuards(FirebaseAuthGuard)
    @Get()
    async dashboard(@FirebaseUser() firebaseUser: DecodedIdToken): Promise<DashboardResponseDto> {
        // check if the user is logging in the first time
        let responseJson;
        const user = await this.userService.findUserById(firebaseUser.uid);
        const status = user ? 'EXISTING_USER' : 'NEW_USER';

        if (!user) {
            responseJson = { status };
        }
        else {
            const plain = instanceToPlain(user, { exposeUnsetFields: false });
            const userResponseDto = plainToInstance(UserResponseDto, plain, { excludeExtraneousValues: true });
            responseJson = {
                status,
                data: userResponseDto,
            }
        }


        // OBVIOUSLY THIS WILL NEED TO CHANGE IN THE FUTURE BC WE'RE RETURNING DATA THAT'S PRESENT ON THE DASHBOARD...NOT JUST USER DATA
        return plainToInstance(DashboardResponseDto, responseJson);
    }
}
