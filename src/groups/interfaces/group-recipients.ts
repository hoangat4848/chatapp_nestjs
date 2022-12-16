import { Group } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  AddGroupUserReponse,
  RemoveGroupRecipientParams,
} from 'src/utils/types';

export interface IGroupRecipientsService {
  addGroupRecipient(
    params: AddGroupRecipientParams,
  ): Promise<AddGroupUserReponse>;
  removeGroupRecipient(params: RemoveGroupRecipientParams): Promise<Group>;
}
