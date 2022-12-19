import { Friend } from 'src/utils/typeorm';
import { CreateFriendParams } from 'src/utils/types';

export interface IFriendsService {
  createFriendRequest(params: CreateFriendParams): Promise<Friend>;
  isFriendRequestPending(userOneId: number, userTwoId: number): Promise<Friend>;
  isFriends(userOneId: number, userTwoId: number): Promise<Friend>;
}
