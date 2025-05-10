import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class CreateColumnDto {
  @Transform(({ value }): string => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  name: string;
}
