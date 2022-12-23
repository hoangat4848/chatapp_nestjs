import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { MessagingGateway } from 'src/gateway/gateway';
import { IGatewaySession } from 'src/gateway/gateway.session';
import { ServerEvents, Services, WebsocketEvents } from 'src/utils/constants';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import { AcceptFriendRequestResponse } from 'src/utils/types';

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

  @OnEvent(ServerEvents.FRIEND_REQUEST_CANCELED)
  handleFriendRequestCanceledEvent(payload: FriendRequest) {
    const receiverSocket = this.gatewaySessionsService.getUserSocket(
      payload.receiver.id,
    );

    if (receiverSocket)
      receiverSocket.emit(
        'onFriendRequestCanceled',
        plainToInstance(FriendRequest, plainToInstance(FriendRequest, payload)),
      );
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_ACCEPTED)
  handleFriendRequestAcceptedEvent(payload: AcceptFriendRequestResponse) {
    console.log('inside' + ServerEvents.FRIEND_REQUEST_ACCEPTED);
    const { friend, friendRequest } = payload;
    const senderSocket = this.gatewaySessionsService.getUserSocket(
      friendRequest.sender.id,
    );
    if (senderSocket)
      senderSocket.emit(WebsocketEvents.FRIEND_REQUEST_ACCEPTED, {
        friend: plainToInstance(Friend, friend),
        friendRequest: plainToInstance(FriendRequest, friendRequest),
      });
  }

  @OnEvent(ServerEvents.FRIEND_REQUEST_REJECTED)
  handleFriendRequestRejectedEvent(payload: FriendRequest) {
    const senderSocket = this.gatewaySessionsService.getUserSocket(
      payload.sender.id,
    );
    if (senderSocket)
      senderSocket.emit(
        WebsocketEvents.FRIEND_REQUEST_REJECTED,
        plainToInstance(FriendRequest, payload),
      );
  }
}
