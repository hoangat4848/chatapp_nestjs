import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from 'src/utils/typeorm';
import { Repository, TreeRepositoryUtils } from 'typeorm';
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
}
