import { IsUrl } from 'class-validator';

export class UpdateUrlDTO {
  @IsUrl()
  originalUrl: string;
}
