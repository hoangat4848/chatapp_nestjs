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
import { IFriendsService } from 'src/friends/friends';
import { IGroupsService } from 'src/groups/interfaces/groups';
import { Services } from 'src/utils/constants';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import {
  Conversation,
  Friend,
  Group,
  GroupMessage,
  Message,
  User,
} from 'src/utils/typeorm';
import {
  AddGroupUserReponse,
  CreateGroupMessageResponse,
  CreateMessageResponse,
  DeleteGroupMessageResponse,
  DeleteMessageReponse,
  GroupUserLeaveEventPayload,
  RemoveGroupUserReponse,
} from 'src/utils/types';
import { IGatewaySession } from './gateway.session';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 15000,
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
    @Inject(Services.FRIENDS)
    private readonly friendsService: IFriendsService,
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

    socket.emit('onlineGroupUsersReceived', {
      onlineUsers: plainToInstance(User, onlineUsers),
      offlineUsers: plainToInstance(User, offlineUsers),
    });
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

  @SubscribeMessage('getOnlineFriends')
  async handleFriendListRetrieve(
    @MessageBody() data: any,
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    const { user } = socket;
    if (!user) return;
    const friends = await this.friendsService.getFriends(user.id);
    const onlineFriends = friends.filter((friend) =>
      this.sessionsService.getUserSocket(
        user.id === friend.receiver.id ? friend.sender.id : friend.receiver.id,
      ),
    );
    socket.emit('getOnlineFriends', plainToInstance(Friend, onlineFriends));
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

  @OnEvent('group.created')
  async handleGroupCreated(payload: Group) {
    const sockets: AuthenticatedSocket[] = [];
    payload.users.forEach((user) => {
      const socket = this.sessionsService.getUserSocket(user.id);
      socket && socket.emit('onGroupCreate', payload);
    });
  }

  @OnEvent('group.message.created')
  async handleGroupMessageCreated(payload: CreateGroupMessageResponse) {
    const { group } = payload;
    const userIds = group.users.map((user) => user.id);
    console.log('ok');

    const sockets = userIds.map((userId) =>
      this.sessionsService.getUserSocket(userId),
    );
    console.log(sockets);

    sockets.forEach(
      (socket) => socket && socket.emit('onGroupMessage', payload),
    );
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

  @OnEvent('group.user.added')
  async handleGroupUserAdded(payload: AddGroupUserReponse) {
    const { group, user } = payload;
    const recipientSocket = this.sessionsService.getUserSocket(user.id);

    // Send event & group to the new user
    if (recipientSocket)
      recipientSocket.emit('onGroupUserAdd', plainToInstance(Group, group));

    // Send event to all pariticpants in room
    this.server
      .to(`group-${payload.group.id}`)
      .emit('onGroupReceivedNewUser', payload);
  }

  @OnEvent('group.user.removed')
  async handleGroupUserRemoved(payload: RemoveGroupUserReponse) {
    const { group, user } = payload;

    const ROOM_NAME = `group-${group.id}`;
    const removedUserSocket = this.sessionsService.getUserSocket(user.id);

    if (removedUserSocket) {
      removedUserSocket.emit('onGroupRemoved', group);
      removedUserSocket.leave(ROOM_NAME);
    }

    const transformedPayload = {
      group: plainToInstance(Group, group),
      user: plainToInstance(User, user),
    };
    this.server
      .to(ROOM_NAME)
      .emit('onGroupRecipientRemoved', transformedPayload);
  }

  @OnEvent('group.owner.updated')
  async handleGroupOwnerUpdated(payload: Group) {
    const ROOM_NAME = `group-${payload.id}`;
    console.log('inside group.owner.updated');
    this.server
      .to(ROOM_NAME)
      .emit('onGroupOwnerUpdate', plainToInstance(Group, payload));
  }

  @OnEvent('group.user.leave')
  async handleGroupUserLeave(payload: GroupUserLeaveEventPayload) {
    const { group, userId } = payload;
    console.log('inside group.user.leave');
    const ROOM_NAME = `group-${payload.group.id}`;
    const { rooms } = this.server.sockets.adapter;
    const socketsInRoom = rooms.get(ROOM_NAME);
    const leftUserSocket = this.sessionsService.getUserSocket(userId);
    /**
     * If socketsInRoom is undefined, this means that there is
     * no one connected to the room. So just emit the event for
     * the connected user if they are online.
     */
    if (leftUserSocket && socketsInRoom) {
      console.log('user is online, at least 1 person is in the room');
      if (socketsInRoom.has(leftUserSocket.id)) {
        console.log('User is in room... room set has socket id');
        return this.server
          .to(ROOM_NAME)
          .emit('onGroupParticipantLeft', payload);
      } else {
        console.log('User is not in room, but someone is there');
        leftUserSocket.emit('onGroupParticipantLeft', payload);
        this.server.to(ROOM_NAME).emit('onGroupParticipantLeft', payload);
        return;
      }
    }
    if (leftUserSocket && !socketsInRoom) {
      console.log('User is online but there are no sockets in the room');
      return leftUserSocket.emit('onGroupParticipantLeft', payload);
    }
  }
}
