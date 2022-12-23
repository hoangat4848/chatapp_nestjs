import { Group } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  AddGroupUserReponse,
  CheckUserInGroupParams,
  LeaveGroupParams,
  RemoveGroupRecipientParams,
  RemoveGroupUserReponse,
} from 'src/utils/types';

export interface IGroupRecipientsService {
  addGroupRecipient(
    params: AddGroupRecipientParams,
  ): Promise<AddGroupUserReponse>;
  removeGroupRecipient(
    params: RemoveGroupRecipientParams,
  ): Promise<RemoveGroupUserReponse>;
  leaveGroup(params: LeaveGroupParams): Promise<Group>;
  isUserInGroup(params: CheckUserInGroupParams): Promise<Group>;
}
