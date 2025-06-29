import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('users') 
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  findAll() {
    return this.userService.findAll();
  }

  @Get('exists/:userId')
  @ApiOperation({ summary: 'Check if a user with the given ID exists' })
  @ApiParam({ name: 'userId', description: 'ID of the user to check' })
  @ApiResponse({ status: 200, description: 'Returns true if user exists, false otherwise' })
  @ApiNotFoundResponse({ description: 'User not found (optional handling)' })
  async userExists(@Param('userId') userId: string): Promise<{ exists: boolean }> {
    const exists = await this.userService.userExists(userId);
    return { exists };
  }
}