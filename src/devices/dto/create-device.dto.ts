import { IsString, IsOptional, MinLength } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(3)
  serial: string;

  @IsOptional()
  @IsString()
  model?: string;
}
