import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedirectController } from 'src/redirect/redirect.controller';
import { RedirectService } from 'src/redirect/redirect.service';

describe('RedirectController', () => {
  let controller: RedirectController;
  let redirectService: RedirectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedirectController],
      providers: [
        {
          provide: RedirectService,
          useValue: {
            getOriginalUrlAndIncrementClicks: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RedirectController>(RedirectController);
    redirectService = module.get<RedirectService>(RedirectService);
  });

  describe('redirectToOriginal', () => {
    it('deve redirecionar para a URL original se shortUrl existir', async () => {
      const mockUrlEntity = { originalUrl: 'https://nestjs.com/' };
      redirectService.getOriginalUrlAndIncrementClicks = jest.fn().mockResolvedValue(mockUrlEntity);
  
      const res = {
        redirect: jest.fn(),
      } as any;
  
      await controller.redirectToOriginal('abc123', res);
  
      expect(redirectService.getOriginalUrlAndIncrementClicks).toHaveBeenCalledWith('abc123');
      expect(res.redirect).toHaveBeenCalledWith('https://nestjs.com/');
    });

    it('deve lançar NotFoundException se shortUrl não existir', async () => {
      (redirectService.getOriginalUrlAndIncrementClicks as jest.Mock).mockResolvedValue(null);
  
      const res = {
        redirect: jest.fn(),
      } as any;
  
      await expect(controller.redirectToOriginal('Shortened URL not found', res)).rejects.toThrow(NotFoundException);
      expect(redirectService.getOriginalUrlAndIncrementClicks).toHaveBeenCalledWith('Shortened URL not found');
      expect(res.redirect).not.toHaveBeenCalled();
    });
  })

});
