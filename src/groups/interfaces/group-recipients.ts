import { Group } from 'src/utils/typeorm';
import {
  AddGroupRecipientParams,
  RemoveGroupRecipientParams,
} from 'src/utils/types';

export interface IGroupRecipientsService {
  addGroupRecipient(params: AddGroupRecipientParams): Promise<Group>;
  removeGroupRecipient(params: RemoveGroupRecipientParams): Promise<Group>;
}
