import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UrlsService } from 'src/urls/urls.service';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<Partial<Repository<UserEntity>>>;
  let urlService: UrlsService;

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
    };

    urlService = {
      getUserUrls: jest.fn(),
    } as unknown as jest.Mocked<UrlsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepository },
        { provide: UrlsService, useValue: urlService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    urlService = module.get<UrlsService>(UrlsService);
  });

  describe('getByEmail', () => {
    it('deve retornar o usuário pelo email (happy path)', async () => {
      const user = { id: 1, email: 'test@email.com' } as any;
      userRepository.findOneBy= jest.fn().mockResolvedValue(user);
    
      const result = await service.getByEmail('test@email.com');
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@email.com' });
      expect(result).toBe(user);
    });

    it('deve lançar BadRequestException se o email for vazio', async () => {
      await expect(service.getByEmail('')).rejects.toThrow('Email field is empty');
    });

  });

  describe('getById', () => {
    it('deve retornar os dados do usuário e estatísticas (happy path)', async () => {
      const user = { id: 1, name: 'Marlon', email: 'marlon@email.com', createdAt: new Date() } as any;
      const userUrls = [
        { clicks: 2 },
        { clicks: 3 },
      ];
      userRepository.findOne= jest.fn().mockResolvedValue(user);
      urlService.getUserUrls = jest.fn().mockResolvedValue(userUrls);
    
      const result = await service.getById(1);
    
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(urlService.getUserUrls).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        shortenedUrl: 2,
        clicksReceived: 5,
      });
    });

    it('deve retornar null se o id não for informado', async () => {
      const result = await service.getById(undefined as any);
      expect(result).toBeNull();
    });

    it('deve lançar NotFoundException se o usuário não for encontrado', async () => {
      userRepository.findOne= jest.fn().mockResolvedValue(null);
    
      await expect(service.getById(123)).rejects.toThrow('Id not found');
    });

    it('deve retornar shortenedUrl e clicksReceived como 0 se userUrls não for array', async () => {
      const user = { id: 1, name: 'Marlon', email: 'marlon@email.com', createdAt: new Date() } as any;
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      urlService.getUserUrls = jest.fn().mockResolvedValue(null);
    
      const result = await service.getById(1);
    
      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        shortenedUrl: 0,
        clicksReceived: 0,
      });
    });

  });
});
