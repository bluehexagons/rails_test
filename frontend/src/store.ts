import { Store } from '@tanstack/store';

export interface User {
  id: number;
  email: string | null;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

export const authStore = new Store<AuthState>({
  token: localStorage.getItem('token') || null,
  user: null,
  isAuthenticated: !!localStorage.getItem('token'),
});

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
    authStore.setState((state) => ({
      ...state,
      token,
      isAuthenticated: true,
    }));
  } else {
    localStorage.removeItem('token');
    authStore.setState((state) => ({
      ...state,
      token: null,
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
