import { GroupMessage } from 'src/utils/typeorm';
import {
  CreateGroupMessageParams,
  CreateGroupMessageResponse,
  DeleteGroupMessageParams,
  GetGroupMessagesParams,
} from 'src/utils/types';

export interface IGroupMessagesService {
  createGroupMessage(
    params: CreateGroupMessageParams,
  ): Promise<CreateGroupMessageResponse>;
  getGroupMessages(params: GetGroupMessagesParams): Promise<GroupMessage[]>;
  deleteGroupMessage(params: DeleteGroupMessageParams);
}
