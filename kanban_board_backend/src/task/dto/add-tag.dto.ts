import { Transform } from 'class-transformer';
import { IsUUID, IsString, MinLength } from 'class-validator';

export class AddTagDto {
  @IsUUID()
  taskId: string;

  @Transform(({ value }): string => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  name: string;
}
