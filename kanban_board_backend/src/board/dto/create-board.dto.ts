import { Transform } from 'class-transformer';
import { IsString, MinLength } from 'class-validator';

export class CreateBoardDto {
  @Transform(({ value }): string => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  title: string;
}
