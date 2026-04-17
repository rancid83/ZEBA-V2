export type AuthUser = {
  id?: number;
  email: string;
  name?: string;
  company_name?: string;
  write_permission_yn?: 'Y' | 'N';
};

export interface AuthSlice {
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

export const createAuthSlice = (set: any) => ({
  user: null,
  setUser: (user: AuthUser) => set({ user }, false, 'auth/setUser'),
  clearUser: () => set({ user: null }, false, 'auth/clearUser'),
});
