import { User } from './entities/User';
import { Session } from './entities/Session';
import { Conversation } from './entities/Conversation';
import { Message } from './entities/Message';
import { Group } from './entities/Group';
import { GroupMessage } from './entities/GroupMessage';
import { Friend } from './entities/Friend';
import { FriendRequest } from './entities/FriendRequest';
import { Profile } from './entities/Profile';
import { MessageAttachment } from './entities/MessageAttachment';
import { GroupMessageAttachment } from './entities/GroupMessageAttachment';

const entities = [
  User,
  Session,
  Conversation,
  Message,
  MessageAttachment,
  Group,
  GroupMessage,
  GroupMessageAttachment,
  Friend,
  FriendRequest,
  Profile,
];

export default entities;

export {
  User,
  Session,
  Conversation,
  Message,
  MessageAttachment,
  Group,
  GroupMessage,
  GroupMessageAttachment,
  Friend,
  FriendRequest,
  Profile,
};
