import { Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { IConversationsService } from 'src/conversations/conversations';
import { Services } from 'src/utils/constants';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Conversation, Group, Message } from 'src/utils/typeorm';
import {
  CreateGroupMessageResponse,
  CreateMessageResponse,
  DeleteGroupMessageResponse,
  DeleteMessageReponse,
} from 'src/utils/types';
import { IGatewaySession } from './gateway.session';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly sessionsService: IGatewaySession,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
  ) {}

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    socket.emit('connected', 'asdsad');
    this.sessionsService.setUserSocket(socket.user.id, socket);
  }

  handleDisconnect(client: any) {
    console.log(`Client ${client} disconnected`);
  }

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create Message');
  }

  @SubscribeMessage('onConversationJoin')
  handleOnConversationJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(
      `${client.id} joined room ${`conversation-${data.conversationId}`}`,
    );
    client.join(`conversation-${data.conversationId}`);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('userJoin');
  }

  @SubscribeMessage('onConversationLeave')
  handleOnConversationLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(
      `${client.id} left room ${`conversation-${data.conversationId}`}`,
    );
    client.leave(`conversation-${data.conversationId}`);
    console.log(client.rooms);
    client.to(`conversation-${data.conversationId}`).emit('userLeave');
  }

  @SubscribeMessage('onGroupJoin')
  handleOnGroupJoin(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(`${client.id} joined room ${`group-${data.groupId}`}`);
    client.join(`group-${data.groupId}`);
    console.log(client.rooms);
    client.to(`group-${data.groupId}`).emit('userJoinGroup');
  }

  @SubscribeMessage('onGroupLeave')
  handleOnGroupLeave(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log(`${client.id} left room ${`group-${data.groupId}`}`);
    client.leave(`group-${data.groupId}`);
    console.log(client.rooms);
    client.to(`group-${data.groupId}`).emit('userLeaveGroup');
  }

  @SubscribeMessage('onTypingStart')
  async handleOnTypingStart(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('user is typing');
    console.log(client.rooms);
    client.broadcast
      .to(`conversation-${data.conversationId}`)
      .emit('onUserTyping');
  }

  @SubscribeMessage('onTypingStop')
  async handleOnTypingStop(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('user stop typing');
    client.broadcast
      .to(`conversation-${data.conversationId}`)
      .emit('onUserStopTyping');
  }

  @OnEvent('conversation.created')
  handleConversationCreatedEvent(payload: Conversation) {
    const receiverSocket = this.sessionsService.getUserSocket(
      payload.recipient.id,
    );
    if (receiverSocket) receiverSocket.emit('onConversation', payload);
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: CreateMessageResponse) {
    console.log('Inside message.create');
    console.log(payload);
    const {
      author,
      conversation: { creator, recipient },
    } = payload.message;

    const authorSocket = this.sessionsService.getUserSocket(author.id);

    const receiver = author.id === creator.id ? recipient : creator;
    const receiverSocket = this.sessionsService.getUserSocket(receiver.id);

    if (authorSocket) authorSocket.emit('onMessage', payload);
    if (receiverSocket) receiverSocket.emit('onMessage', payload);
  }

  @OnEvent('message.deleted')
  async handleMessageDeletedEvent(payload: DeleteMessageReponse) {
    const conversation = await this.conversationsService.findConversationById(
      payload.conversationId,
    );
    if (!conversation) return;
    const { creator, recipient } = conversation;
    const recipientId =
      payload.userId === creator.id ? recipient.id : creator.id;

    const recipientSocket = this.sessionsService.getUserSocket(recipientId);
    if (recipientSocket) recipientSocket.emit('onMessageDelete', payload);
  }

  @OnEvent('message.updated')
  async handleMessageUpdatedEvent(payload: Message) {
    const {
      author,
      conversation: { creator, recipient },
    } = payload;

    const recipientId = author.id === creator.id ? recipient.id : creator.id;
    const recipientSocket = this.sessionsService.getUserSocket(recipientId);

    if (recipientSocket) recipientSocket.emit('onMessageUpdate', payload);
  }

  @OnEvent('group.message.created')
  async handleGroupMessageCreated(payload: CreateGroupMessageResponse) {
    const { group } = payload;
    const userIds = group.users.map((user) => user.id);
    const sockets = userIds.map((userId) =>
      this.sessionsService.getUserSocket(userId),
    );
    sockets.forEach(
      (socket) => socket && socket.emit('onGroupMessage', payload),
    );
  }

  @OnEvent('group.created')
  async handleGroupCreated(payload: Group) {
    console.log('inside handleGroupCreated');
    const sockets: AuthenticatedSocket[] = [];
    payload.users.forEach((user) => {
      const socket = this.sessionsService.getUserSocket(user.id);
      socket && socket.emit('onGroupCreate', payload);
    });
  }

  @OnEvent('group.message.deleted')
  async handleGroupMessageDeleted(payload: DeleteGroupMessageResponse) {}
}
