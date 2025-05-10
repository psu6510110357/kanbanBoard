import { IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^\S*$/, {
    message: 'Username cannot contain spaces',
  })
  username: string;

  @Matches(/^\S*$/, {
    message: 'Username cannot contain spaces',
  })
  @IsString()
  password: string;
}
