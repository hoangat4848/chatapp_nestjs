import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GroupMessage } from './GroupMessage';
import { User } from './User';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  title?: string;

  @ManyToOne(() => User)
  @JoinColumn()
  creator: User;

  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable()
  users: User[];

  @OneToMany(() => GroupMessage, (groupMessage) => groupMessage.group, {
    cascade: ['insert', 'remove', 'update'],
  })
  messages: GroupMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => GroupMessage)
  @JoinColumn()
  lastMessageSent: GroupMessage;

  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt: Date;
}
