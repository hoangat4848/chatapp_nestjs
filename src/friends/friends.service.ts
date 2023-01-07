import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend, User } from 'src/utils/typeorm';
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
        sender: {
          profile: true,
        },
        receiver: {
          profile: true,
        },
      },
    });
  }

  async deleteFriend(params: DeleteFriendParams): Promise<Friend> {
    const { id, userId } = params;

    const friend = await this.findFriendById(id);
    if (!friend) throw new FriendNotFoundException();

    if (friend.receiver.id !== userId && friend.sender.id !== userId)
      throw new DeleteFriendException();

    await this.friendsRepository.delete({ id });
    return friend;
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

  isFriends(userOneId: number, userTwoId: number): Promise<Friend> {
    return this.friendsRepository.findOne({
      where: [
        {
          sender: { id: userOneId },
          receiver: { id: userTwoId },
        },
        {
          sender: { id: userTwoId },
          receiver: { id: userOneId },
        },
      ],
    });
  }
}
