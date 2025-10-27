export interface JwtPayload {
  sub: number; // id-ul user-ului
  username: string; // username-ul
  role: 'admin' | 'operator';
}
