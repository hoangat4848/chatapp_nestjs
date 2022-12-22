import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { MessagingGateway } from 'src/gateway/gateway';
import { IGatewaySession } from 'src/gateway/gateway.session';
import { ServerEvents, Services, WebsocketEvents } from 'src/utils/constants';
import { Friend, FriendRequest } from 'src/utils/typeorm';
import {
  AcceptFriendRequestResponse,
  RemoveFriendEventPayload,
} from 'src/utils/types';

@Injectable()
export class FriendsEvents {
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly gatewaySessionsService: IGatewaySession,
    @Inject(MessagingGateway)
    private readonly gateway: MessagingGateway,
  ) {}

  @OnEvent(ServerEvents.FRIEND_REMOVED)
  handleFriendRemoved({ friend, userId }: RemoveFriendEventPayload) {
    const { sender, receiver } = friend;
    const socket = this.gatewaySessionsService.getUserSocket(
      receiver.id === userId ? sender.id : receiver.id,
    );
    socket?.emit(
      WebsocketEvents.FRIEND_REMOVED,
      plainToInstance(Friend, friend),
    );
  }
}
