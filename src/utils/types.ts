import { Conversation, Group, GroupMessage, Message, User } from './typeorm';

export type CreateUserDetails = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type ValidateUsertDetails = {
  email: string;
  password: string;
};

export type FindUserParams = Partial<{
  id: number;
  email: string;
}>;

export type CreateConversationParams = {
  email: string;
  message?: string;
};
export interface AuthenticatedRequest extends Request {
  user: User;
}

export type CreateMessageParams = {
  user: User;
  content: string;
  conversationId: number;
};

export type CreateMessageResponse = {
  message: Message;
  conversation: Conversation;
};

export type DeleteMessageParams = {
  userId: number;
  conversationId: number;
  messageId: number;
};

export type EditMessageParams = {
  conversationId: number;
  messageId: number;
  userId: number;
  content: string;
};

export type CreateGroupParams = {
  creator: User;
  users: string[];
  title?: string;
};

export type FetchGroupParams = {
  userId: number;
};

export type CreateGroupMessageParams = {
  author: User;
  groupId: number;
  content: string;
};

export type CreateGroupMessageResponse = {
  message: GroupMessage;
  group: Group;
};

export type GetGroupMessagesParams = {
  userId: number;
  groupId: number;
};
