import {
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkipThrottle } from '@nestjs/throttler';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, ServerEvents, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { DeleteFriendParams } from 'src/utils/types';
import { IFriendsService } from './friends';

@SkipThrottle()
@Controller(Routes.FRIENDS)
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendsService: IFriendsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get()
  getFriends(@AuthUser() user: User) {
    return this.friendsService.getFriends(user.id);
  }

  @Delete(':id')
  async deleteFriend(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params: DeleteFriendParams = {
      id,
      userId,
    };

    const deletedFriend = await this.friendsService.deleteFriend(params);
    this.eventEmitter.emit(ServerEvents.FRIEND_REMOVED, {
      friend: deletedFriend,
      userId,
    });
    return deletedFriend;
  }
}
