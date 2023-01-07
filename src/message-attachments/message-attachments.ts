import { GroupMessageAttachment } from 'src/utils/typeorm';
import { MessageAttachment } from 'src/utils/typeorm/entities/MessageAttachment';
import { Attachment } from 'src/utils/types';

export interface IMessageAttachmentsService {
  create(attachments: Attachment[]): Promise<MessageAttachment[]>;
  createGroupAttachments(
    attachments: Attachment[],
  ): Promise<GroupMessageAttachment[]>;
  deleteAllAttachments(attachments: MessageAttachment[]);
}
