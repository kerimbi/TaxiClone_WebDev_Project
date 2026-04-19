export interface User {
  id: number;
  username: string;
  email: string;
  role: 'rider' | 'driver' | 'admin';
  phone: string;
  rating: number;
  profile_pic?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}
