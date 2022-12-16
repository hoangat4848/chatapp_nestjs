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
import { plainToInstance } from 'class-transformer';
import { Server } from 'socket.io';
import { IConversationsService } from 'src/conversations/conversations';
import { IGroupsService } from 'src/groups/interfaces/groups';
import { Services } from 'src/utils/constants';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Conversation, Group, GroupMessage, Message } from 'src/utils/typeorm';
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
    @Inject(Services.GROUPS)
    private readonly groupsService: IGroupsService,
  ) {}

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    socket.emit('connected', 'asdsad');
    this.sessionsService.setUserSocket(socket.user.id, socket);
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    console.log('handleDisconnect');
    console.log(`${socket.user.email} disconnected.`);
    this.sessionsService.removeUserSocket(socket.user.id);
  }

  @SubscribeMessage('getOnlineGroupUsers')
  async handleGetOnlineGroupUsers(
    @MessageBody() data: { groupId: number },
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    console.log('handle...');
    console.log(data);
    const clientsInRoom = this.server.sockets.adapter.rooms.get(
      `group-${data.groupId}`,
    );
    const group = await this.groupsService.findGroupById(data.groupId);
    if (!group) return;
    const onlineUsers = [];
    const offlineUsers = [];
    group.users.forEach((user) => {
      const socket = this.sessionsService.getUserSocket(user.id);
      socket ? onlineUsers.push(user) : offlineUsers.push(user);
    });

    console.log(onlineUsers);
    console.log(offlineUsers);
    socket.emit('onlineGroupUsersReceived', { onlineUsers, offlineUsers });
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
    const sockets: AuthenticatedSocket[] = [];
    payload.users.forEach((user) => {
      const socket = this.sessionsService.getUserSocket(user.id);
      socket && socket.emit('onGroupCreate', payload);
    });
  }

  @OnEvent('group.message.deleted')
  async handleGroupMessageDeleted(payload: DeleteGroupMessageResponse) {}

  @OnEvent('group.message.updated')
  async handleGroupMessageUpdated(payload: GroupMessage) {
    console.log('inside handle group message updated');

    const room = `group-${payload.group.id}`;
    console.log(room);

    this.server
      .to(room)
      .emit('onGroupMessageUpdate', plainToInstance(GroupMessage, payload));
  }
}
