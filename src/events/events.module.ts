import { Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { FriendRequestsEvents } from './friend-requests.event';
import { FriendsEvents } from './friends.event';

@Module({
  imports: [GatewayModule],
  providers: [FriendRequestsEvents, FriendsEvents],
})
export class EventsModule {}
