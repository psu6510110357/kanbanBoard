import { IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1)
  @Matches(/^\S*$/, {
    message: 'Username cannot contain spaces',
  })
  username: string;

  @Matches(/^\S*$/, {
    message: 'Username cannot contain spaces',
  })
  @IsString()
  @MinLength(8)
  password: string;
}
