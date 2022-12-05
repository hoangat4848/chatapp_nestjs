import {
  CreateGroupMessageParams,
  CreateGroupMessageResponse,
} from 'src/utils/types';

export interface IGroupMessagesService {
  createGroupMessage(
    params: CreateGroupMessageParams,
  ): Promise<CreateGroupMessageResponse>;
}
