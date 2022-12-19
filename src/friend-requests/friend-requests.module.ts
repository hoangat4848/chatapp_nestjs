import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { Services } from 'src/utils/constants';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { FriendRequestsController } from './friend-requests.controller';
import { FriendRequestsService } from './friend-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([FriendRequest, Friend]), UsersModule],
  controllers: [FriendRequestsController],
  providers: [
    { provide: Services.FRIEND_REQUESTS, useClass: FriendRequestsService },
  ],
})
export class FriendRequestsModule {}
