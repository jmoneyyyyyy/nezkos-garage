import { createContext } from "react";
import type { User } from "firebase/auth";

export type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<unknown>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthState | null>(null);
