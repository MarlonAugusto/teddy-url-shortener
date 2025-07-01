import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedirectService } from 'src/redirect/redirect.service';
import { UrlEntity } from 'src/urls/models/url.entity';
import { Repository } from 'typeorm';

describe('RedirectService', () => {
  let service: RedirectService;
  let urlRepository: jest.Mocked<Partial<Repository<UrlEntity>>>;

  beforeEach(async () => {
    urlRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedirectService,
        {
          provide: getRepositoryToken(UrlEntity),
          useValue: urlRepository,
        },
      ],
    }).compile();

    service = module.get<RedirectService>(RedirectService);
  });

  describe('getOriginalUrlAndIncrementClicks', () => {
    it('deve retornar a URL original e incrementar o número de cliques', async () => {
      const shortUrl = 'ABC123';
      const urlEntity = {
        originalUrl: 'https://example.com',
        shortUrl,
        clicks: 0,
        active: true,
      };

      urlRepository.findOne = jest.fn().mockResolvedValue(urlEntity);
      urlRepository.save = jest.fn().mockResolvedValue(urlEntity);

      const result = await service.getOriginalUrlAndIncrementClicks(shortUrl);

      expect(result).toEqual(urlEntity);
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { shortUrl, active: true },
      });
      expect(urlRepository.save).toHaveBeenCalledWith({
        ...urlEntity,
        clicks: 1,
      });
    });

    it('deve retornar null se a URL encurtada não for encontrada ou estiver inativa', async () => {
      const shortUrl = 'ABC123';

      urlRepository.findOne = jest.fn().mockResolvedValue(null);

      const result = await service.getOriginalUrlAndIncrementClicks(shortUrl);

      expect(result).toBeNull();
      expect(urlRepository.findOne).toHaveBeenCalledWith({
        where: { shortUrl, active: true },
      });
    });
  });
});
