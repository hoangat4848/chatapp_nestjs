import { Exclude } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Group } from './Group';
import { Message } from './Message';
import { Profile } from './Profile';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Message, (message) => message.author)
  messages: Message[];

  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[];

  @OneToOne(() => Profile)
  @JoinColumn()
  profile: Profile;
}
