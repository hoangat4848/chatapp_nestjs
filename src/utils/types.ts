import { Conversation, Message, User } from './typeorm';

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
  recipientId: number;
  message: string;
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
