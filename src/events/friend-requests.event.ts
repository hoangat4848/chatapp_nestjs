import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { MessagingGateway } from 'src/gateway/gateway';
import { IGatewaySession } from 'src/gateway/gateway.session';
import { Services } from 'src/utils/constants';
import { FriendRequest } from 'src/utils/typeorm';

@Injectable()
export class FriendRequestsEvents {
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly gatewaySessionsService: IGatewaySession,
    @Inject(MessagingGateway)
    private readonly gateway: MessagingGateway,
  ) {}

  @OnEvent('friend.request.created')
  handleFriendRequestCreatedEvent(payload: FriendRequest) {
    console.log('friend request created');
    const receiverSocket = this.gatewaySessionsService.getUserSocket(
      payload.receiver.id,
    );
    console.log(receiverSocket?.id);
    if (receiverSocket)
      receiverSocket.emit(
        'onFriendRequestReceived',
        plainToInstance(FriendRequest, payload),
      );
  }
}
