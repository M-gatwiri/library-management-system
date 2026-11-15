export type UserRole = 'MEMBER' | 'LIBRARIAN';

export interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest {
  user: JwtPayload;
}
