import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/utils/typeorm';
import { DeleteFriendParams } from 'src/utils/types';
import { Repository, TreeRepositoryUtils } from 'typeorm';
import { DeleteFriendException } from './exceptions/DeleteFriend';
import { FriendNotFoundException } from './exceptions/FriendNotFound';
import { IFriendsService } from './friends';

@Injectable()
export class FriendsService implements IFriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepository: Repository<Friend>,
  ) {}

  getFriends(userId: number): Promise<Friend[]> {
    return this.friendsRepository.find({
      where: [
        {
          sender: { id: userId },
        },
        {
          receiver: { id: userId },
        },
      ],
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }

  async deleteFriend(params: DeleteFriendParams) {
    const { id, userId } = params;

    const friend = await this.findFriendById(id);
    if (!friend) throw new FriendNotFoundException();

    if (friend.receiver.id !== userId && friend.sender.id !== userId)
      throw new DeleteFriendException();

    return this.friendsRepository.delete({ id });
  }

  findFriendById(id: number): Promise<Friend> {
    return this.friendsRepository.findOne({
      where: {
        id,
      },
      relations: {
        sender: true,
        receiver: true,
      },
    });
  }
}
