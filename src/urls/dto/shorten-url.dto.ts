import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class shortenUrlDTO {
    @IsNotEmpty()
    @IsString()
    originalUrl: string;

    @IsOptional()
    userId?: number;
}
