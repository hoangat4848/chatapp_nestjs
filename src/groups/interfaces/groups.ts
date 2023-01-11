import { Group } from 'src/utils/typeorm/entities/Group';
import {
  AccessParams,
  CreateGroupParams,
  FetchGroupParams,
  TransferGroupOwnerParams,
  UpdateGroupDetailsParams,
} from 'src/utils/types';

export interface IGroupsService {
  createGroup(params: CreateGroupParams): Promise<Group>;
  getGroups(params: FetchGroupParams): Promise<Group[]>;
  findGroupById(id: number): Promise<Group>;
  saveGroup(group: Group): Promise<Group>;
  hasAccess(params: AccessParams): Promise<boolean>;
  transferGroupOwner(params: TransferGroupOwnerParams): Promise<Group>;
  updateDetails(params: UpdateGroupDetailsParams): Promise<Group>;
}
