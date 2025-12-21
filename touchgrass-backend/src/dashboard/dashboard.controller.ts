import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FirebaseAuthGuard } from '../firebase/auth/firebase-auth.guard';
import { FirebaseUser } from '../firebase/auth/firebase-user.decorator';
import { UserService } from '../user/user.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

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
        const user = await this.userService.findUser(firebaseUser.uid);
        const status = user ? 'EXISTING_USER' : 'NEW_USER';


        // OBVIOUSLY THIS WILL NEED TO CHANGE IN THE FUTURE BC WE'RE RETURNING DATA THAT'S PRESENT ON THE DASHBOARD...NOT JUST USER DATA
        const data = user ||  {};
        return { status, data } as DashboardResponseDto;
    }
}
