import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlEntity } from 'src/urls/models/url.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RedirectService {
    constructor(
        @InjectRepository(UrlEntity) private readonly urlRepository: Repository<UrlEntity>,
    ) {}

    async getOriginalUrlAndIncrementClicks(shortUrl: string) {
        const urlEntity = await this.urlRepository.findOne({ where: { shortUrl, active: true } });

        if (!urlEntity)
            return null;

        urlEntity.clicks += 1;
        await this.urlRepository.save(urlEntity);

        return urlEntity;
    }
}
