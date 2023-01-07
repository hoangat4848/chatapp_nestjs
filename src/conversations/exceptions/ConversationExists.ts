import { HttpException, HttpStatus } from '@nestjs/common';

export class ConversationExistsException extends HttpException {
  constructor() {
    super('Conversation already exists', HttpStatus.CONFLICT);
  }
}
