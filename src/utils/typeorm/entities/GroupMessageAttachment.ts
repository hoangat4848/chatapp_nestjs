import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GroupMessage } from './GroupMessage';
import { Message } from './Message';

@Entity({ name: 'group_message_attachments' })
export class GroupMessageAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @ManyToOne(() => GroupMessage, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  message: GroupMessage;
}
