import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlsService } from 'src/urls/urls.service';
import { UserEntity } from 'src/user/models/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly urlService: UrlsService,
  ) {}
  async getByEmail(userEmail: string) {
    if (!userEmail) throw new BadRequestException('Email field is empty');
    return this.userRepository.findOneBy({ email: userEmail });
  }

  async getById(userId: number) {
    if (!userId) return null;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('Id not found');
    const userUrls = await this.urlService.getUserUrls(userId);
    const countShortenedUrl = Array.isArray(userUrls) ? userUrls.length : 0;
    const countClicks = Array.isArray(userUrls)
      ? userUrls.map((u) => u.clicks).reduce((acc, clicks) => acc + clicks, 0)
      : 0;

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      shortenedUrl: countShortenedUrl,
      clicksReceived: countClicks
    };

    return userData;
  }
}
