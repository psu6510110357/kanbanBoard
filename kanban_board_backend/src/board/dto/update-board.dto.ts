import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateBoardDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;
}
