"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Interfaces
interface Blocked {
  id: string;
  blockedStart: string;
  blockedEnd: string;
  reason: string;
}
interface Resource {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pricePerHour: number;
  ownerId: string;
  Blocked: Blocked[];
}

export default function EditResourcePage() {
  // State para o formulário de edição
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // State para o formulário de bloqueio
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // State de controle
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user, isLoading: isAuthLoading } = useAuth();

  const fetchResource = useCallback(async () => {
    if (id) {
      try {
        const response = await api.get(`/resource/${id}`);
        const resData = response.data;
        setResource(resData);
        setName(resData.name);
        setDescription(resData.description || '');
        setImageUrl(resData.imageUrl || '');
        setPricePerHour(String(resData.pricePerHour));
      } catch (err) {
        setError("Não foi possível carregar o recurso.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchResource();
  }, [id, user, isAuthLoading, router, fetchResource]);

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.patch(`/resource/${id}`, { name, description, imageUrl, pricePerHour: parseFloat(pricePerHour) });
      router.push('/resources/me');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao atualizar o recurso.');
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/resource/${id}/block`, { 
        blockedStart: new Date(blockStartTime).toISOString(), 
        blockedEnd: new Date(blockEndTime).toISOString(), 
        reason: blockReason 
      });
      fetchResource();
      setBlockStartTime('');
      setBlockEndTime('');
      setBlockReason('');
    } catch (err) { 
      console.error("Failed to add block", err);
      setError("Falha ao adicionar período de bloqueio.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja deletar este recurso? Esta ação não pode ser desfeita.")) {
      try {
        await api.delete(`/resource/${id}`);
        router.push('/resources/me');
      } catch (err) {
        setError("Falha ao deletar o recurso.");
      }
    }
  };

  if (isLoading || isAuthLoading) {
    return <div className="text-center p-8">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Formulário de Edição Principal */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Editar Recurso</h1>
          <form className="space-y-6" onSubmit={handleUpdateSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Recurso</label>
              <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} className="block w-full mt-1 p-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="block w-full mt-1 p-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL da Imagem</label>
              <input id="imageUrl" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="block w-full mt-1 p-2 border rounded-md"/>
            </div>
            <div>
              <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700">Preço por Hora (R$)</label>
              <input id="pricePerHour" type="number" required value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} className="block w-full mt-1 p-2 border rounded-md"/>
            </div>
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar Alterações</button>
          </form>
        </div>

        {/* Gerenciamento de Bloqueios */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Gerenciar Períodos Bloqueados</h2>
          {/* ... (formulário de bloqueio) */}
        </div>

        {/* Zona de Perigo */}
        <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-4">Zona de Perigo</h2>
          <button onClick={handleDelete} className="w-full py-2 px-4 bg-red-600 text-white font-bold rounded-md hover:bg-red-700">
            Deletar Permanentemente este Recurso
          </button>
        </div>
      </div>
    </div>
  );
}