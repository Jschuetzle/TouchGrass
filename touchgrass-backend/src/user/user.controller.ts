import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiNotFoundResponse, ApiParam, ApiBadRequestResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { User } from './user.entity';

@ApiTags('users') 
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    description: 'Payload to create a user',
    type: CreateUserDto,
    examples: {
      example1: {
        summary: 'Basic user creation payload',
        value: {
          id: 'user_abc123',
          username: 'abhi_b',
          firstname: 'Abhi',
          lastname: 'Bangaru',
          email: 'abhi@example.com',
          // password: 'supersecurepassword',
          profile_pic: 'https://cdn.example.com/pfp.jpg',
          phone_number: '+15555555555',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Validation failed or duplicate user' })
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

  @Get('search')
  @ApiOperation({ summary: 'Search users by username' })
  @ApiQuery({ name: 'query', required: true, description: 'Search term (username)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of users to return per page', example: 10 })
  @ApiResponse({ status: 200, description: 'List of users matching the query', type: [User] })
  @ApiBadRequestResponse({ description: 'Search query must be a non-empty string' })
  async searchUsers(
    @Query('query') query: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    return this.userService.searchUsers(query, page, limit);
  }
}