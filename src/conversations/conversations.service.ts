import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IUsersService } from 'src/users/interfaces/user';
import { Services } from 'src/utils/constants';
import { Conversation, Message, User } from 'src/utils/typeorm';
import {
  AccessParams,
  CreateConversationParams,
  GetConversationMessagesParams,
  UpdateConversationParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IConversationsService } from './conversations';
import { ConversationExistsException } from './exceptions/ConversationExists';
import { ConversationNotFoundException } from './exceptions/ConversationNotFound';
import { CreateConversationException } from './exceptions/CreateConversation';

@Injectable()
export class ConversationsService implements IConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(Services.USERS)
    private readonly usersService: IUsersService,
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

  async findById(id: number): Promise<Conversation | undefined> {
    const conversation = await this.conversationRepository.findOne({
      where: { id },
      relations: {
        creator: {
          profile: true,
        },
        recipient: {
          profile: true,
        },
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
      throw new CreateConversationException(
        'Cannot create conversation with yourself',
      );

    const existingConversation = await this.isCreated(user.id, recipient.id);
    if (existingConversation) throw new ConversationExistsException();

    const conversation = this.conversationRepository.create({
      creator: user,
      recipient: recipient,
    });

    const newConversation = await this.conversationRepository.save(
      conversation,
    );

    if (content) {
      const newMessage = this.messageRepository.create({
        author: user,
        content,
        conversation,
      });

      const savedMessage = await this.messageRepository.save(newMessage);
    }

    return newConversation;
  }

  async hasAccess(params: AccessParams): Promise<boolean> {
    const { id: conversationId, userId } = params;

    const conversation = await this.findById(conversationId);
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

  save(conversation: Conversation): Promise<Conversation> {
    return this.conversationRepository.save(conversation);
  }

  getMessages({
    conversationId,
    limit,
  }: GetConversationMessagesParams): Promise<Conversation> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .where('id = :id', { id: conversationId })
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where('conversation.id = :id', { id: conversationId })
      .orderBy('message.createdAt', 'DESC')
      .limit(limit)
      .getOne();
  }

  update({ conversationId, lastMessageSent }: UpdateConversationParams) {
    return this.conversationRepository.update(conversationId, {
      lastMessageSent,
    });
  }
}
