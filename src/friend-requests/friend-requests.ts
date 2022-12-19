import { Friend, FriendRequest } from 'src/utils/typeorm';
import {
  CreateFriendRequestParams,
  AcceptFriendRequestParams,
} from 'src/utils/types';

export interface IFriendRequestsService {
  create(params: CreateFriendRequestParams): Promise<FriendRequest>;
  isPending(userOneId: number, userTwoId: number);
  isFriends(userOneId: number, userTwoId: number);
  accept(params: AcceptFriendRequestParams): Promise<Friend>;
  findById(id: number): Promise<FriendRequest>;
}
