import { IsString, IsOptional, MinLength, IsIn } from 'class-validator';

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

  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @IsOptional()
  @IsIn(['online', 'offline'])
  status?: 'online' | 'offline';
}
