import { Controller, Post, Get, Body } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() body: { username: string; profile_pic: string }) {
    return this.userService.create(body.username, body.profile_pic);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }
}