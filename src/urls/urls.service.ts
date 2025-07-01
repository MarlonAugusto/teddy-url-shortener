import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UrlEntity } from './models/url.entity';
import { Repository } from 'typeorm';
import { shortenUrlDTO } from './dto/shorten-url.dto';
import { randomUUID } from 'crypto';
import { UserEntity } from 'src/user/models/user.entity';
import { formatedDate } from 'src/common/date.utils';

@Injectable()
export class UrlsService {
    constructor(
        @InjectRepository(UrlEntity) private readonly urlRepository: Repository<UrlEntity>,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    ) { }

    async shortenUrl({ originalUrl, userId }: shortenUrlDTO) {
        if (!originalUrl) throw new BadRequestException("Original URL is required");

        const generateShortId = (length: number): string => {
            return randomUUID().replace(/-/g, '').substring(0, length).toUpperCase();
        };
        const shortUrl = generateShortId(6);

        let user: UserEntity | undefined;
        let userData: { id: number; name: string; email: string } | string = "Not authenticated";

        if (userId) {
            user = await this.userRepository.findOneBy({ id: userId }) || undefined;
        }
        if (user) {
            userData = {
                id: user.id,
                name: user.name,
                email: user.email,
            };
        }
        const newUrl = this.urlRepository.create({
            originalUrl,
            shortUrl,
            user
        });

        await this.urlRepository.save(newUrl);

        return {
            originalUrl,
            shortUrl: `http://localhost:${process.env.API_PORT}/${newUrl.shortUrl}`,
            user: userData,
        };
    }

    async getUserUrls(userId) {
        const urls = await this.urlRepository.find({
            where: { user: { id: userId }, active: true },
            select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'updatedAt']
        });

        const formattedUrls = urls.map(url => ({
            id: url.id,
            originalUrl: url.originalUrl,
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            clicks: url.clicks,
            createdAt: formatedDate(url.createdAt.toISOString()),
            updatedAt: url.updatedAt ? formatedDate(url.updatedAt?.toISOString()) : ""
        }));

        return urls.length > 0 ? formattedUrls : `User doesn't have shortened URLs`;
    }

    async deleteUrl(userId: number, urlId: number) {
        const url = await this.urlRepository.findOne({
            where: { id: urlId, user: { id: userId }, active: true },
        });

        if (!url)
            throw new BadRequestException('URL not found or does not belong to the user');

        url.active = false;
        url.updatedAt = new Date();
        url.deletedAt = new Date();

        await this.urlRepository.save(url);

        return {
            message: `Shortened URL has been successfully deleted`,
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            originalUrl: url.originalUrl
        };
    }

    async updateUrl(userId: number, urlId: number, newOriginalUrl: string) {
        const url = await this.urlRepository.findOne({
            where: { id: urlId, user: { id: userId }, active: true },
        });

        if (!url)
            throw new BadRequestException('URL not found or does not belong to the user');

        url.originalUrl = newOriginalUrl;
        url.updatedAt = new Date();

        await this.urlRepository.save(url);

        return {
            message: "Shortened URL has been successfully updated.",
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            originalUrl: url.originalUrl,
            updatedAt: url.updatedAt ? formatedDate(url.updatedAt.toISOString()): ""
        };
    }

    async getUrlById(userId: number, urlId: number) {
        const url = await this.urlRepository.findOne({
            where: { id: urlId, user: { id: userId }, active: true },
            select: ['id', 'originalUrl', 'shortUrl', 'clicks', 'createdAt', 'updatedAt']
        });
    
        if (!url) {
            throw new NotFoundException('URL not found or does not belong to the user');
        }
    
        return {
            id: url.id,
            originalUrl: url.originalUrl,
            shortUrl: `http://localhost:${process.env.API_PORT}/${url.shortUrl}`,
            clicks: url.clicks,
            createdAt: formatedDate(url.createdAt.toISOString()),
            updatedAt: url.updatedAt ? formatedDate(url.updatedAt.toISOString()) : ""
        };
    }
    
}
