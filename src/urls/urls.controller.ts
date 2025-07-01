import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { UrlsService } from './urls.service';
import { shortenUrlDTO } from './dto/shorten-url.dto';

@Controller('short/url')
export class UrlsController {
  constructor(private urlService: UrlsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async shortenUrl(@Body() body: shortenUrlDTO, @Request() req) {
    const userId = req.user?.id || null;

    return this.urlService.shortenUrl({ ...body, userId });
  }

  @UseGuards(AuthGuard)
  @Get()
  async getUrls(@Request() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }

    return this.urlService.getUserUrls(userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUrl(@Param('id') id: number, @Request() req) {
    const userId = req.user.id;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return this.urlService.deleteUrl(userId, id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUrl(
    @Param('id') id: number,
    @Body('originalUrl') newOriginalUrl: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return this.urlService.updateUrl(userId, id, newOriginalUrl);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getUrlById(@Param('id') id: number, @Request() req) {
    const userId = req.user.id;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return this.urlService.getUrlById(userId, id);
  }
}
