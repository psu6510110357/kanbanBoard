import { JwtUser } from 'src/auth/types/jwt-user.type';
import { Request } from 'express';

export interface AuthRequest<
  TParams extends Record<string, string> = Record<string, string>,
  TBody = any,
  TQuery extends Record<string, any> = Record<string, any>,
> extends Request<TParams, any, TBody, TQuery> {
  user: JwtUser;
}
