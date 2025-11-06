'use server';

import { getCookie } from 'cookies-next';
import { AuthProvider } from '@/contexts/AuthContext';
import { cookies } from 'next/headers';

export default async function AuthTokenProvider({ children }: { children: React.ReactNode }) {
  const authToken = await getCookie('authToken', { cookies });

  return <AuthProvider token={authToken}>{children}</AuthProvider>;
}
