import { Test, TestingModule } from '@nestjs/testing';
import { RedirectService } from 'src/redirect/redirect.service';

describe('RedirectService', () => {
  let service: RedirectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedirectService],
    }).compile();

    service = module.get<RedirectService>(RedirectService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
