import { IsUUID } from 'class-validator';

export class RemoveTagDto {
  @IsUUID()
  taskId: string;

  @IsUUID()
  tagId: string;
}
