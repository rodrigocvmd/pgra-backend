"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function MyProfilePage() {
  const { user, logout, isLoading: isAuthLoading, login } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push('/login');
    } else {
      // Busca os dados mais recentes do usuário, caso o nome tenha sido atualizado
      const fetchUserData = async () => {
        try {
          const response = await api.get('/auth/profile');
          setName(response.data.name || '');
          setEmail(response.data.email);
        } catch (err) {
          console.error("Failed to fetch profile", err);
          setError("Não foi possível carregar os dados do perfil.");
        }
      };
      fetchUserData();
    }
  }, [user, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password && password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!user) return;

    try {
      const payload: { name: string; email: string; password?: string } = { name, email };
      if (password) {
        payload.password = password;
      }

      const response = await api.patch(`/user/${user.id}`, payload);
      
      // Se o email foi alterado, o token antigo pode ser invalidado.
      // O ideal seria o backend retornar um novo token. Por enquanto, apenas mostramos sucesso.
      setSuccess("Perfil atualizado com sucesso!");
      setPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      setError(err.response?.data?.message || "Falha ao atualizar o perfil.");
    }
  };

  if (isAuthLoading || !user) {
    return <div className="text-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full mt-1 p-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full mt-1 p-2 border rounded-md"/>
            </div>
            <div className="border-t pt-6">
              <p className="text-sm text-gray-600 mb-2">Alterar senha (deixe em branco para não mudar)</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="password"
                         className="block text-sm font-medium text-gray-700">Nova Senha</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full mt-1 p-2 border rounded-md"/>
                </div>
                <div>
                  <label htmlFor="confirmPassword"
                         className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                  <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="block w-full mt-1 p-2 border rounded-md"/>
                </div>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar Alterações</button>
          </form>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <button onClick={() => { logout(); router.push('/'); }} className="w-full py-2 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700">
            Sair (Logout)
          </button>
        </div>
      </div>
    </div>
  );
}
