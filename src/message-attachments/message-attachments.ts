import { MessageAttachment } from 'src/utils/typeorm/entities/MessageAttachment';
import { Attachment } from 'src/utils/types';

export interface IMessageAttachmentsService {
  create(attachments: Attachment[]): Promise<MessageAttachment[]>;
  deleteAllAttachments(attachments: MessageAttachment[]);
}
