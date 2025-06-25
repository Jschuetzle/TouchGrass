import {
    Controller,
    Post,
    Body,
    Delete,
    Get,
    Query,
    Param,
    ParseIntPipe,
  } from '@nestjs/common';
  import { FriendService } from './friend.service';
  import { SendRequestDto } from './dto/send-request.dto';
  import { AcceptRequestDto } from './dto/accept-request.dto';
  import { DeclineRequestDto } from './dto/decline-request.dto';
  import { RemoveFriendDto } from './dto/remove-friend.dto';
  
  @Controller('friends')
  export class FriendController {
    constructor(private readonly friendService: FriendService) {}
  
    @Post('request')
    sendRequest(@Body() dto: SendRequestDto) {
      return this.friendService.sendFriendRequest(dto.fromId, dto.toId);
    }
  
    @Post('accept')
    acceptRequest(@Body() dto: AcceptRequestDto) {
      return this.friendService.acceptFriendRequest(
        dto.currentUserId,
        dto.requesterId,
      );
    }
  
    @Post('decline')
    declineRequest(@Body() dto: DeclineRequestDto) {
      return this.friendService.declineFriendRequest(
        dto.currentUserId,
        dto.requesterId,
      );
    }
  
    @Delete()
    removeFriend(@Body() dto: RemoveFriendDto) {
      return this.friendService.removeFriend(dto.userId1, dto.userId2);
    }
  
    @Get(':userId')
    getFriends(
    @Param('userId') userId: string,
      @Query('search') search: string,
      @Query('page') page: string,
      @Query('limit') limit: string,
    ) {
      return this.friendService.getFriends(
        userId,
        search || '',
        parseInt(page || '1'),
        parseInt(limit || '10'),
      );
    }
  
    @Get('requests/:userId')
    getRequests(@Param('userId', ParseIntPipe) userId: string) {
      return this.friendService.getFriendRequests(userId);
    }
  }