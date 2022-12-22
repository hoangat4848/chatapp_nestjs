import { Friend } from 'src/utils/typeorm';
import { DeleteFriendParams } from 'src/utils/types';

export interface IFriendsService {
  getFriends(userId: number): Promise<Friend[]>;
  findFriendById(id: number): Promise<Friend>;
  deleteFriend(params: DeleteFriendParams): Promise<Friend>;
}
