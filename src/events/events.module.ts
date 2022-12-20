import { Module } from '@nestjs/common';
import { GatewayModule } from 'src/gateway/gateway.module';
import { FriendRequestsEvents } from './friend-requests.event';

@Module({
  imports: [GatewayModule],
  providers: [FriendRequestsEvents],
})
export class EventsModule {}
