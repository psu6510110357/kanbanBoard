import { JwtUser } from 'src/auth/types/jwt-user.type';

export interface AuthRequest extends Request {
  user: JwtUser;
}
