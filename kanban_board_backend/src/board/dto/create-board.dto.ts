import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  title: string;
}
