import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { DeleteFriendParams } from 'src/utils/types';
import { IFriendsService } from './friends';

@Controller(Routes.FRIENDS)
@UseGuards(AuthenticatedGuard)
export class FriendsController {
  constructor(
    @Inject(Services.FRIENDS) private readonly friendsService: IFriendsService,
  ) {}

  @Get()
  getFriends(@AuthUser() user: User) {
    return this.friendsService.getFriends(user.id);
  }

  @Delete(':id')
  deleteFriend(
    @AuthUser() { id: userId }: User,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const params: DeleteFriendParams = {
      id,
      userId,
    };

    return this.friendsService.deleteFriend(params);
  }
}
