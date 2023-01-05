import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IMessageAttachmentsService } from 'src/message-attachments/message-attachments';
import { Services } from 'src/utils/constants';
import { Conversation, Message } from 'src/utils/typeorm';
import {
  CreateMessageParams,
  CreateMessageResponse,
  DeleteMessageParams,
  EditMessageParams,
} from 'src/utils/types';
import { Repository } from 'typeorm';
import { IMessagesService } from './messages';

@Injectable()
export class MessagesService implements IMessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.MESSAGE_ATTACHMENTS)
    private readonly messageAttachmentsService: IMessageAttachmentsService,
  ) {}

  async createMessage(
    params: CreateMessageParams,
  ): Promise<CreateMessageResponse> {
    const { user, conversationId, content, attachments } = params;
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: [
        'creator',
        'recipient',
        'lastMessageSent',
        'creator.profile',
        'recipient.profile',
      ],
    });
    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    if (
      conversation.creator.id !== user.id &&
      conversation.recipient.id !== user.id
    ) {
      throw new HttpException(
        'Cannot create message in this conversation',
        HttpStatus.FORBIDDEN,
      );
    }

    const newMessage = await this.messageRepository.create({
      conversation,
      author: user,
      content,
      attachments: attachments
        ? await this.messageAttachmentsService.create(attachments)
        : [],
    });
    const savedMessage = await this.messageRepository.save(newMessage);

    conversation.lastMessageSent = savedMessage;
    const updatedConversation = await this.conversationRepository.save(
      conversation,
    );

    return { message: savedMessage, conversation: updatedConversation };
  }

  async getMessagesByConversationId(
    conversationId: number,
  ): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
      order: {
        createdAt: 'DESC',
      },
      relations: {
        author: {
          profile: true,
        },
        attachments: true,
      },
      select: {
        author: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    });
  }

  async deleteMessage(params: DeleteMessageParams) {
    const { conversationId, userId, messageId } = params;

    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.id = :conversationId', { conversationId })
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .orderBy('message.createdAt', 'DESC')
      .limit(5)
      .getOne();

    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        conversation: { id: conversationId },
        author: { id: userId },
      },
    });
    if (!message)
      throw new HttpException('Cannot delete message', HttpStatus.BAD_REQUEST);

    // Deleting last message
    if (conversation.lastMessageSent.id === message.id) {
      const SECOND_MESSAGE_INDEX = 1;
      if (conversation.messages.length <= 1) {
        await this.conversationRepository.update(
          { id: conversationId },
          {
            lastMessageSent: null,
            lastMessageSentAt: null,
          },
        );
      } else {
        const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];

        await this.conversationRepository.update(
          { id: conversationId },
          {
            lastMessageSent: newLastMessage,
            lastMessageSentAt: newLastMessage.createdAt,
          },
        );
      }
    }

    await this.messageRepository.delete({ id: message.id });
  }

  async editMessage(params: EditMessageParams): Promise<Message> {
    const { conversationId, messageId, userId, content } = params;
    const messageDB = await this.messageRepository.findOne({
      where: {
        id: messageId,
        author: {
          id: userId,
        },
        conversation: {
          id: conversationId,
        },
      },
      relations: {
        conversation: {
          creator: true,
          recipient: true,
        },
        author: true,
      },
    });
    if (!messageDB)
      throw new HttpException('Cannot Edit Message', HttpStatus.BAD_REQUEST);

    messageDB.content = content;
    const updatedMessage = await this.messageRepository.save(messageDB);
    return updatedMessage;
  }
}
