import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IMessagesService } from 'src/messages/messages';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUsersService } from 'src/users/interfaces/user';
import { Services } from 'src/utils/constants';
import { Conversation, User } from 'src/utils/typeorm';
import { AccessParams, CreateConversationParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IConversationsService } from './conversations';
import { ConversationNotFoundException } from './exceptions/ConversationNotFound';

@Injectable()
export class ConversationsService implements IConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.USERS)
    private readonly usersService: IUsersService,
    @Inject(Services.MESSAGES)
    private readonly messagesService: IMessagesService,
  ) {}

  async getConversations(id: number): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoin('conversation.creator', 'creator')
      .addSelect([
        'creator.id',
        'creator.firstName',
        'creator.lastName',
        'creator.username',
      ])
      .leftJoin('conversation.recipient', 'recipient')
      .addSelect([
        'recipient.id',
        'recipient.firstName',
        'recipient.lastName',
        'recipient.username',
      ])
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('conversation.lastMessageSentAt', 'DESC')
      .getMany();
  }

  async findConversationById(id: number): Promise<Conversation | undefined> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: {
        creator: true,
        recipient: true,
        lastMessageSent: true,
      },
    });

    return conversation;
  }

  async createConversation(user: User, params: CreateConversationParams) {
    const { username, message: content } = params;

    const recipient = await this.usersService.findUser({ username });
    if (!recipient) throw new UserNotFoundException();

    if (user.id === recipient.id)
      throw new HttpException(
        'Cannot Create Conversation',
        HttpStatus.BAD_REQUEST,
      );

    const existingConversation = await this.isCreated(user.id, recipient.id);
    if (existingConversation)
      throw new HttpException('Conversation exists', HttpStatus.CONFLICT);

    const conversation = this.conversationRepository.create({
      creator: user,
      recipient: recipient,
    });

    const newConversation = await this.conversationRepository.save(
      conversation,
    );

    if (content) {
      const { message: newMessage } = await this.messagesService.createMessage({
        user,
        content,
        conversationId: newConversation.id,
      });
    }

    return newConversation;
  }

  async hasAccess(params: AccessParams): Promise<boolean> {
    const { id: conversationId, userId } = params;

    const conversation = await this.findConversationById(conversationId);
    if (!conversation) throw new ConversationNotFoundException();
    return (
      conversation.creator.id === userId || conversation.recipient.id === userId
    );
  }

  async isCreated(userId: number, recipientId: number) {
    return this.conversationRepository.findOne({
      where: [
        {
          creator: { id: userId },
          recipient: { id: recipientId },
        },
        {
          creator: { id: recipientId },
          recipient: { id: userId },
        },
      ],
    });
  }
}
