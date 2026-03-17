import { Store } from '@tanstack/store';

export interface User {
  id: number;
  email: string | null;
  username: string;
  admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export const authStore = new Store<AuthState>({
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
});

export const setToken = (token: string | null, refreshToken?: string | null) => {
  const hasRefreshToken = refreshToken !== undefined;
  if (token) {
    localStorage.setItem('token', token);
    if (hasRefreshToken) {
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }
    }
    authStore.setState((state) => ({
      ...state,
      token,
      refreshToken: hasRefreshToken ? refreshToken : state.refreshToken,
      isAuthenticated: true,
    }));
  } else {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    authStore.setState((state) => ({
      ...state,
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    }));
  }
};

export const setUser = (user: User | null) => {
  authStore.setState((state) => ({
    ...state,
    user,
  }));
};
