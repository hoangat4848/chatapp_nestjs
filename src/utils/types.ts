import { Request } from 'express';
import { Conversation, Group, GroupMessage, Message, User } from './typeorm';

export interface AuthenticatedRequest extends Request {
  user: User;
}

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

export type DeleteMessageReponse = {
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

export type DeleteGroupMessageParams = {
  userId: number;
  groupId: number;
  messageId: number;
};

export type DeleteGroupMessageResponse = {
  userId: number;
  groupId: number;
  messageId: number;
};

export type EditGroupMessageParams = {
  userId: number;
  groupId: number;
  messageId: number;
  content: string;
};

export type AddGroupRecipientParams = {
  issuerId: number;
  groupId: number;
  email: string;
};

export type AddGroupUserReponse = {
  group: Group;
  user: User;
};

export type RemoveGroupRecipientParams = {
  issuerId: number;
  groupId: number;
  removeUserId: number;
};

export type RemoveGroupUserReponse = {
  group: Group;
  user: User;
};

export type AccessParams = {
  id: number;
  userId: number;
};

export type TransferGroupOwnerParams = {
  userId: number;
  groupId: number;
  newOwnerId: number;
};

export type LeaveGroupParams = {
  userId: number;
  groupId: number;
};

export type CheckUserInGroupParams = {
  userId: number;
  groupId: number;
};

export type GroupUserLeaveEventPayload = {
  group: Group;
  userId: number;
};

export type CreateFriendRequestParams = {
  user: User;
  email: string;
};

export type FriendRequestStatus = 'accepted' | 'pending' | 'blocked';

export type AcceptFriendRequestParams = {
  id: number;
  userId: number;
};

export type CancelFriendRequestParams = {
  id: number;
  userId: number;
};
