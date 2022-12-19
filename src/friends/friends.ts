import { Friend } from 'src/utils/typeorm';

export interface IFriendsService {
  getFriends(userId: number): Promise<Friend[]>;
}
