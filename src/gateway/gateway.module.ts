import { Module } from '@nestjs/common';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { GroupsModule } from 'src/groups/groups.module';
import { Services } from 'src/utils/constants';
import { MessagingGateway } from './gateway';
import { GatewaySessionManager } from './gateway.session';

@Module({
  imports: [ConversationsModule, GroupsModule],
  providers: [
    MessagingGateway,
    {
      provide: Services.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
  exports: [
    MessagingGateway,
    {
      provide: Services.GATEWAY_SESSION_MANAGER,
      useClass: GatewaySessionManager,
    },
  ],
})
export class GatewayModule {}
