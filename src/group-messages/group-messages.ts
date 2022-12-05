import { Group, GroupMessage } from 'src/utils/typeorm';
import { CreateGroupMessageParams } from 'src/utils/types';

export interface IGroupMessagesService {
  createGroupMessage(
    params: CreateGroupMessageParams,
  ) /* : Promise<GroupMessage> */;
}
