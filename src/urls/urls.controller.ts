import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UrlsService } from './urls.service';
import { shortenUrlDTO } from './dto/shorten-url.dto';
import {
  DeleteUrlResponse,
  ShortenUrlResponse,
  UpdateUrlResponse,
} from './dto/url-response.dto';

@Controller('short/url')
export class UrlsController {
  constructor(private urlService: UrlsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async shortenUrl(
    @Body() body: shortenUrlDTO,
    @Request() req,
  ): Promise<ShortenUrlResponse> {
    const userId = req.user?.id || null;

    return this.urlService.shortenUrl({ ...body, userId });
  }

  @UseGuards(AuthGuard)
  @Get()
  async getUrls(@Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    return this.urlService.getUserUrls(userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUrl(
    @Param('id') id: number,
    @Request() req,
  ): Promise<DeleteUrlResponse> {
    const userId = req.user?.id;
    if (!userId || !id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.urlService.deleteUrl(userId, id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUrl(
    @Param('id') id: number,
    @Body('originalUrl') newOriginalUrl: string,
    @Request() req,
  ): Promise<UpdateUrlResponse> {
    const userId = req.user?.id;
    if (!userId || !id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.urlService.updateUrl(userId, id, newOriginalUrl);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUrlById(@Param('id') id: number, @Request() req) {
    const userId = req.user?.id;
    if (!userId || !id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.urlService.getUrlById(userId, id);
  }
}
