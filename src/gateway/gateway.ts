import { Inject, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Services } from 'src/utils/constants';
import { AuthenticatedSocket } from 'src/utils/interfaces';
import { Message } from 'src/utils/typeorm';
import { IGatewaySession } from './gateway.session';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection {
  constructor(
    @Inject(Services.GATEWAY_SESSION_MANAGER)
    private readonly sessionsService: IGatewaySession,
  ) {}

  handleConnection(socket: AuthenticatedSocket, ...args: any[]) {
    // console.log('New incoming request');
    // socket.emit('connected', { msg: 'hello world' });
    this.sessionsService.setUserSocket(socket.user.id, socket);
    // console.dir(this.sessionsService.getSockets());
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('Create Message');
  }

  @OnEvent('message.created')
  handleMessageCreatedEvent(payload: Message) {
    console.log('Inside message.create');
    console.log(payload);
    const {
      author,
      conversation: { creator, recipient },
    } = payload;
    const authorSocket = this.sessionsService.getUserSocket(author.id);

    const receiver = author.id === creator.id ? recipient : creator;
    const receiverSocket = this.sessionsService.getUserSocket(receiver.id);

    console.log('author>>>', JSON.stringify(authorSocket?.user));
    console.log('recipient>>>', JSON.stringify(receiverSocket?.user));
    if (authorSocket) authorSocket.emit('onMessage', payload);
    if (receiverSocket) receiverSocket.emit('onMessage', payload);

    // this.server.emit('onMessage', payload);
  }
}
