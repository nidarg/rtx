import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';

export class UpdateDeviceDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  serial?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsIn(['online', 'offline'])
  status?: 'online' | 'offline';

  @IsOptional()
  @IsString()
  firmwareVersion?: string;
}
