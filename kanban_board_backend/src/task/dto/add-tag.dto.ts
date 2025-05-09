import { IsUUID, IsString } from 'class-validator';

export class AddTagDto {
  @IsUUID()
  taskId: string;

  @IsString()
  name: string;
}
