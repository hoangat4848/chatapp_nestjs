import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IConversationsService } from 'src/conversations/conversations';
import { ConversationNotFoundException } from 'src/conversations/exceptions/ConversationNotFound';
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
import { CannotDeleteMessageException } from './exceptions/CannotDeleteMessage';
import { IMessagesService } from './messages';

@Injectable()
export class MessagesService implements IMessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
    @Inject(Services.MESSAGE_ATTACHMENTS)
    private readonly messageAttachmentsService: IMessageAttachmentsService,
  ) {}

  async createMessage(
    params: CreateMessageParams,
  ): Promise<CreateMessageResponse> {
    const { user, conversationId, content, attachments } = params;
    const conversation = await this.conversationsService.findById(
      conversationId,
    );
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
    const updatedConversation = await this.conversationsService.save(
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

    const msgParams = { conversationId, limit: 5 };
    const conversation = await this.conversationsService.getMessages(msgParams);

    if (!conversation) throw new ConversationNotFoundException();

    const message = await this.messageRepository.findOne({
      where: {
        id: messageId,
        conversation: { id: conversationId },
        author: { id: userId },
      },
    });
    if (!message) throw new CannotDeleteMessageException();

    // Deleting last message
    if (conversation.lastMessageSent.id !== message.id)
      return this.messageRepository.delete({ id: message.id });

    return this.deleteLastMessage(conversation, message);
  }

  async deleteLastMessage(conversation: Conversation, message: Message) {
    const size = conversation.messages.length;
    const SECOND_MESSAGE_INDEX = 1;
    if (size <= 1) {
      await this.conversationsService.update({
        conversationId: conversation.id,
        lastMessageSent: null,
      });
      return this.messageRepository.delete({ id: message.id });
    } else {
      const newLastMessage = conversation.messages[SECOND_MESSAGE_INDEX];
      await this.conversationsService.update({
        conversationId: conversation.id,
        lastMessageSent: newLastMessage,
      });
      return this.messageRepository.delete({ id: message.id });
    }
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
