import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import { Response } from 'express';

import { UrlsService } from 'src/urls/urls.service';
import { RedirectService } from './redirect.service';

@Controller()
export class RedirectController {
  constructor(private redirectService: RedirectService) {}

  @Get(':shortUrl')
  async redirectToOriginal(
    @Param('shortUrl') shortUrl: string,
    @Res() res: Response,
  ) {
    const urlEntity =
      await this.redirectService.getOriginalUrlAndIncrementClicks(shortUrl);
    if (!urlEntity) {
      throw new NotFoundException('Shortened URL not found');
    }
    return res.redirect(urlEntity.originalUrl);
  }
}
