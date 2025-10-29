"use client";

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CustomAlert from '@/components/CustomAlert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      const response = await api.post('/auth/signin', { email, password });
      login(response.data.access_token);
      router.push('/'); // Redireciona para a home após o login
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Falha ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
      {error && <CustomAlert message={error} onClose={() => setError(null)} />}
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Acesse sua conta
        </h1>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-3 py-2 mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Entrar
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link href="/register" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
