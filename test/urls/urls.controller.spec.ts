import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from 'src/auth/auth.guard';
import { UrlsController } from 'src/urls/urls.controller';
import { UrlsService } from 'src/urls/urls.service';

describe('UrlsController', () => {
  let controller: UrlsController;
  let urlService: UrlsService;

  beforeEach(async () => {
    const urlsServiceMock: jest.Mocked<UrlsService> = {
      shortenUrl: jest.fn(),
      getUserUrls: jest.fn(),
      deleteUrl: jest.fn(),
      updateUrl: jest.fn(),
      getUrlById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlsController],
      providers: [{ provide: UrlsService, useValue: urlsServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UrlsController>(UrlsController);
    urlService = module.get<UrlsService>(UrlsService);
  });

  describe('shortenUrl', () => {
    it('deve encurtar uma URL com usuário autenticado', async () => {
      const body = { originalUrl: 'https://nestjs.com/' };
      const req = { user: { id: 1 } };
      const expected = { shortUrl: 'http://localhost:8000/ABC123' };
      urlService.shortenUrl = jest.fn().mockResolvedValue(expected);

      const result = await controller.shortenUrl(body, req as any);
      expect(urlService.shortenUrl).toHaveBeenCalledWith({
        ...body,
        userId: 1,
      });
      expect(result).toBe(expected);
    });

    it('deve encurtar uma URL com usuário não autenticado', async () => {
      const body = { originalUrl: 'https://nestjs.com/' };
      const req = { user: { id: null } };
      const expected = { shortUrl: 'http://localhost:8000/ABC123' };
      urlService.shortenUrl = jest.fn().mockResolvedValue(expected);

      const result = await controller.shortenUrl(body, req as any);
      expect(urlService.shortenUrl).toHaveBeenCalledWith({
        ...body,
        userId: null,
      });
      expect(result).toBe(expected);
    });
  });

  describe('getUrls', () => {
    it('deve retornar as URLs do usuário autenticado', async () => {
      const req = { user: { id: 1 } };
      const expected = [{ id: 1, shortUrl: 'http://localhost:8000/ABC123' }];
      urlService.getUserUrls = jest.fn().mockResolvedValue(expected);

      const result = await controller.getUrls(req as any);
      expect(urlService.getUserUrls).toHaveBeenCalledWith(1);
      expect(result).toBe(expected);
    });
    it('deve lançar BadRequestException se não autenticado', async () => {
      const req = { user: undefined };
      await expect(controller.getUrls(req as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
  describe('deleteUrl', () => {
    it('deve deletar uma URL do usuário autenticado', async () => {
      const req = { user: { id: 1 } };
      const expected = {
        message: 'Shortened URL has been successfully deleted',
      };
      urlService.deleteUrl = jest.fn().mockResolvedValue(expected);

      const result = await controller.deleteUrl(1, req as any);
      expect(urlService.deleteUrl).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(expected);
    });

    it('deve lançar BadRequestException se não autenticado', async () => {
      const req = { user: undefined };
      await expect(controller.deleteUrl(1, req as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se id não for informado', async () => {
      const req = { user: { id: 1 } };
      await expect(
        controller.deleteUrl(undefined as any, req as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateUrl', () => {
    it('deve atualizar uma URL do usuário autenticado', async () => {
      const req = { user: { id: 1 } };
      const expected = {
        message: 'Shortened URL has been successfully updated.',
      };
      urlService.updateUrl = jest.fn().mockResolvedValue(expected);

      const result = await controller.updateUrl(
        1,
        'https://google.com/',
        req as any,
      );
      expect(urlService.updateUrl).toHaveBeenCalledWith(
        1,
        1,
        'https://google.com/',
      );
      expect(result).toBe(expected);
    });

    it('deve lançar BadRequestException se não autenticado', async () => {
      const req = { user: undefined };
      await expect(
        controller.updateUrl(1, 'https://google.com/', req as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se id não for informado', async () => {
      const req = { user: { id: 1 } };
      await expect(
        controller.updateUrl(
          undefined as any,
          'https://google.com/',
          req as any,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUrlById', () => {
    it('deve retornar uma URL do usuário autenticado', async () => {
      const req = { user: { id: 1 } };
      const expected = { id: 1, shortUrl: 'http://localhost:8000/ABC123' };
      urlService.getUrlById = jest.fn().mockResolvedValue(expected);

      const result = await controller.getUrlById(1, req as any);
      expect(urlService.getUrlById).toHaveBeenCalledWith(1, 1);
      expect(result).toBe(expected);
    });

    it('deve lançar BadRequestException se não autenticado', async () => {
      const req = { user: undefined };
      await expect(controller.getUrlById(1, req as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se id não for informado', async () => {
      const req = { user: { id: 1 } };
      await expect(
        controller.getUrlById(undefined as any, req as any),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
