import { Inject, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Services } from 'src/utils/constants';
import { AuthenticatedRequest } from 'src/utils/types';
import { IConversationsService } from '../conversations';
import { ConversationNotFoundException } from '../exceptions/ConversationNotFound';
import { InvalidConversationIdException } from '../exceptions/InvalidConversationId';

export class ConversationMiddleware implements NestMiddleware {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const { id: userId } = req.user;

    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) throw new InvalidConversationIdException();

    const params = { conversationId, userId };
    const isReadable = await this.conversationsService.hasAccess(params);
    if (isReadable) next();
    else throw new ConversationNotFoundException();
  }
}
