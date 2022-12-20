import { Friend, FriendRequest } from 'src/utils/typeorm';
import {
  CreateFriendRequestParams,
  AcceptFriendRequestParams,
  CancelFriendRequestParams,
} from 'src/utils/types';

export interface IFriendRequestsService {
  create(params: CreateFriendRequestParams): Promise<FriendRequest>;
  getFriendRequests(userId: number): Promise<FriendRequest[]>;
  isPending(userOneId: number, userTwoId: number): Promise<FriendRequest>;
  isFriends(userOneId: number, userTwoId: number): Promise<FriendRequest>;
  accept(params: AcceptFriendRequestParams): Promise<Friend>;
  cancel(params: CancelFriendRequestParams);
  reject(params: CancelFriendRequestParams);
  findById(id: number): Promise<FriendRequest>;
}
