import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './Message';

@Entity({ name: 'messages_attachments' })
export class MessageAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  key: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    cascade: ['remove'],
  })
  message: Message;
}
