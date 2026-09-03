export interface AuthData {
  id: number;
  token: string;
  email: string;
  roles: string[];
}

export interface AuthResponse {
  data: AuthData;
  ok: boolean;
  message: string;
}