import { HttpException, HttpStatus } from '@nestjs/common';

export class CreateConversationException extends HttpException {
  constructor(msg?: string) {
    const defaultMsg = 'Create Conversation Exception';

    super(
      msg ? defaultMsg.concat(`:${msg}`) : defaultMsg,
      HttpStatus.BAD_REQUEST,
    );
  }
}
