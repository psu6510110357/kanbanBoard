import { IsUUID } from 'class-validator';

export class AddBoardMemberDto {
  @IsUUID()
  userId: string;
}
