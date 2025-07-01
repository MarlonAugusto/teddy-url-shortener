import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { shortenUrlDTO } from 'src/urls/dto/shorten-url.dto';
import { UrlEntity } from 'src/urls/models/url.entity';
import { UrlsService } from 'src/urls/urls.service';
import { UserEntity } from 'src/user/models/user.entity';
import { Repository } from 'typeorm';

describe('UrlsService', () => {
  let urlService: UrlsService;
  let urlRepository: jest.Mocked<Partial<Repository<UrlEntity>>>;
  let userRepository: jest.Mocked<Partial<Repository<UserEntity>>>;

  beforeEach(async () => {
    urlRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };
    userRepository = {
      findOneBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UrlsService,
        { provide: getRepositoryToken(UrlEntity), useValue: urlRepository },
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
      ],
    }).compile();

    urlService = module.get<UrlsService>(UrlsService);
  });

  describe('shortenUrl', () => {
    it('deve encurtar uma URL com sucesso quando o usuário está autenticado', async () => {
      const shortenUrlDTO: shortenUrlDTO = {
        originalUrl: 'https://nestjs.com/',
        userId: 1,
      };
      const user = {
        id: 1,
        name: 'Marlon',
        email: 'marlon@email.com',
      } as UserEntity;
      const newUrlEntity = {
        id: 1,
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl: 'ABC123',
        user,
      } as any;

      userRepository.findOneBy = jest.fn().mockResolvedValue(user);
      urlRepository.create = jest.fn().mockReturnValue(newUrlEntity);
      urlRepository.save = jest.fn().mockResolvedValue(newUrlEntity);

      const result = await urlService.shortenUrl(shortenUrlDTO);

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({
        originalUrl: shortenUrlDTO.originalUrl,
        shortUrl: `http://localhost:${process.env.API_PORT}/${newUrlEntity.shortUrl}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });

    it('deve encurtar uma URL sem usuário autenticado', async () => {
      const originalUrl = 'https://nestjs.com/';
      const newUrlEntity = {
        id: 1,
        originalUrl,
        shortUrl: 'ABC123',
        user: undefined,
      } as any;

      urlRepository.create = jest.fn().mockReturnValue(newUrlEntity);
      urlRepository.save = jest.fn().mockResolvedValue(newUrlEntity);

      const result = await urlService.shortenUrl({
        originalUrl,
        userId: undefined,
      });

      expect(urlRepository.create).toHaveBeenCalledWith({
        originalUrl,
        shortUrl: expect.any(String),
        user: undefined,
      });
      expect(result).toEqual({
        originalUrl,
        shortUrl: `http://localhost:${process.env.API_PORT}/${newUrlEntity.shortUrl}`,
        user: 'Not registered',
      });
    });

    it('deve encurtar uma URL mesmo se userId for informado mas usuário não existir', async () => {
      const originalUrl = 'https://nestjs.com/';
      userRepository.findOneBy = jest.fn().mockResolvedValue(undefined);

      const newUrlEntity = {
        id: 1,
        originalUrl,
        shortUrl: 'ABC123',
        user: undefined,
      } as any;

      urlRepository.create = jest.fn().mockReturnValue(newUrlEntity);
      urlRepository.save = jest.fn().mockResolvedValue(newUrlEntity);

      const result = await urlService.shortenUrl({ originalUrl, userId: 999 });

      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 999 });
      expect(result.user).toBe('Not registered');
    });

    it('deve lançar BadRequestException se originalUrl não for informado', async () => {
      await expect(
        urlService.shortenUrl({ originalUrl: '', userId: 1 }),
      ).rejects.toThrow('Original URL is required');
    });
  });
  describe('getUserUrls', () => {
    it('deve retornar URLs formatadas se o usuário tiver URLs', async () => {
      urlRepository.find = jest.fn().mockResolvedValue([
        {
          id: 1,
          originalUrl: 'https://nestjs.com/',
          shortUrl: 'ABC123',
          clicks: 5,
          createdAt: new Date('2025-07-01T10:00:00Z'),
          updatedAt: new Date('2025-07-01T10:00:00Z'),
        },
      ]);
      const result = await urlService.getUserUrls(1);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('shortUrl');
    });

    it('deve retornar URLs formatadas se o usuário tiver URLs sem updatedAt', async () => {
      urlRepository.find = jest.fn().mockResolvedValue([
        {
          id: 1,
          originalUrl: 'https://nestjs.com/',
          shortUrl: 'ABC123',
          clicks: 5,
          createdAt: new Date('2025-07-01T10:00:00Z'),
          updatedAt: '',
        },
      ]);
      const result = await urlService.getUserUrls(1);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('shortUrl');
    });

    it('deve retornar mensagem se o usuário não tiver URLs', async () => {
      urlRepository.find = jest.fn().mockResolvedValue([]);
      const result = await urlService.getUserUrls(1);
      expect(result).toBe("User doesn't have shortened URLs");
    });

    it('deve retornar updatedAt como string vazia se updatedAt não existir', async () => {
      urlRepository.find = jest.fn().mockResolvedValue([
        {
          id: 1,
          originalUrl: 'https://nestjs.com/',
          shortUrl: 'ABC123',
          clicks: 5,
          createdAt: new Date('2025-07-01T10:00:00Z'),
          updatedAt: '',
        },
      ]);
      const result = await urlService.getUserUrls(1);
      expect(result[0]).toHaveProperty('updatedAt');
    });
  });
  describe('deleteUrl', () => {
    it('deve lançar BadRequestException se userId não for informado', async () => {
      await expect(urlService.deleteUrl(undefined as any, 1)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('deve lançar BadRequestException se a URL não for encontrada', async () => {
      urlRepository.findOne = jest.fn().mockResolvedValue(null);
      await expect(urlService.deleteUrl(1, 1)).rejects.toThrow(
        'URL not found or does not belong to the user',
      );
    });

    it('deve deletar a URL com sucesso', async () => {
      const url = {
        id: 1,
        originalUrl: 'https://nestjs.com/',
        shortUrl: 'ABC123',
        active: true,
        updatedAt: null,
        deletedAt: null,
      };
      urlRepository.findOne = jest.fn().mockResolvedValue(url);
      urlRepository.save = jest
        .fn()
        .mockResolvedValue({ ...url, active: false });
      const result = await urlService.deleteUrl(1, 1);
      expect(result).toHaveProperty('message');
      expect(urlRepository.save).toHaveBeenCalled();
    });
  });
  describe('updateUrl', () => {
    it('deve lançar BadRequestException se a URL não for encontrada para update', async () => {
      urlRepository.findOne = jest.fn().mockResolvedValue(null);
      await expect(
        urlService.updateUrl(1, 1, 'https://google.com/'),
      ).rejects.toThrow('URL not found or does not belong to the user');
    });

    it('deve atualizar a URL com sucesso', async () => {
      const url = {
        id: 1,
        originalUrl: 'https://nestjs.com/',
        shortUrl: 'ABC123',
        active: true,
        updatedAt: null,
      };
      urlRepository.findOne = jest.fn().mockResolvedValue(url);
      urlRepository.save = jest
        .fn()
        .mockResolvedValue({ ...url, originalUrl: 'https://google.com/' });
      const result = await urlService.updateUrl(1, 1, 'https://google.com/');
      expect(result).toHaveProperty('message');
      expect(urlRepository.save).toHaveBeenCalled();
    });
  });
  describe('getUrlById', () => {
    it('deve lançar NotFoundException se a URL não for encontrada', async () => {
      urlRepository.findOne = jest.fn().mockResolvedValue(null);
      await expect(urlService.getUrlById(1, 1)).rejects.toThrow(
        'URL not found or does not belong to the user',
      );
    });

    it('deve retornar os dados da URL se encontrada', async () => {
      const url = {
        id: 1,
        originalUrl: 'https://nestjs.com/',
        shortUrl: 'ABC123',
        clicks: 5,
        createdAt: new Date('2025-07-01T10:00:00Z'),
        updatedAt: new Date('2025-07-01T10:00:00Z'),
      };
      urlRepository.findOne = jest.fn().mockResolvedValue(url);
      const result = await urlService.getUrlById(1, 1);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('shortUrl');
    });

    it('deve retornar updatedAt como string vazia se updatedAt não existir (null)', async () => {
      const url = {
        id: 1,
        originalUrl: 'https://nestjs.com/',
        shortUrl: 'ABC123',
        clicks: 5,
        createdAt: new Date('2025-07-01T10:00:00Z'),
        updatedAt: '',
      };
      urlRepository.findOne = jest.fn().mockResolvedValue(url);
      const result = await urlService.getUrlById(1, 1);
      expect(result.updatedAt).toBe('');
    });
  });
});
