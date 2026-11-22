import { type User } from '@src/services/auth-service';
import { createContext } from 'react-router';

export const userContext = createContext<User | null>(null);
