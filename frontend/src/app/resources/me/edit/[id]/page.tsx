'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import CustomAlert from '@/components/CustomAlert';
import ConfirmationModal from '@/components/ConfirmationModal';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockModalOpen, setIsDeleteBlockModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

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
        setError('Não foi possível carregar o recurso.');
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

    if (!name || !pricePerHour) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      await api.patch(`/resource/${id}`, {
        name,
        description,
        imageUrl: imageUrl || null,
        pricePerHour: parseFloat(pricePerHour),
      });
      router.push('/resources/me');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao atualizar o recurso.');
    }
  };

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!blockStartTime || !blockEndTime || !blockReason) {
      setError(
        'Por favor, preencha todos os campos para adicionar um bloqueio.',
      );
      return;
    }

    try {
      await api.post(`/resource/${id}/block`, {
        blockedStart: new Date(blockStartTime).toISOString(),
        blockedEnd: new Date(blockEndTime).toISOString(),
        reason: blockReason,
      });
      fetchResource();
      setBlockStartTime('');
      setBlockEndTime('');
      setBlockReason('');
    } catch (err) {
      console.error('Failed to add block', err);
      setError('Falha ao adicionar período de bloqueio.');
    }
  };

  const handleDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      await api.delete(`/resource/${id}`);
      router.push('/resources/me');
    } catch (err) {
      setError('Falha ao deletar o recurso.');
    }
  };

  const handleDeleteBlock = async () => {
    if (selectedBlockId) {
      setIsDeleteBlockModalOpen(false);
      try {
        await api.delete(`/resource/block/${selectedBlockId}`);
        fetchResource(); // Recarrega os dados do recurso
      } catch (err) {
        setError('Falha ao remover o período de bloqueio.');
      }
    }
  };

  if (isLoading || isAuthLoading) {
    return <div className="text-center p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      {error && <CustomAlert message={error} onClose={() => setError(null)} />}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja deletar este recurso? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
        confirmButtonText="Sim, Deletar"
      />
      <ConfirmationModal
        isOpen={isDeleteBlockModalOpen}
        title="Confirmar Remoção"
        message="Tem certeza que deseja remover este bloqueio?"
        onConfirm={handleDeleteBlock}
        onCancel={() => setIsDeleteBlockModalOpen(false)}
        confirmButtonText="Sim, Remover"
      />
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Formulário de Edição Principal */}
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Editar Recurso
          </h1>
          <form className="space-y-6" onSubmit={handleUpdateSubmit}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome do Recurso
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descrição
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                URL da Imagem
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="pricePerHour"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Preço por Hora (R$)
              </label>
              <div className="relative mt-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  R$
                </span>
                <input
                  id="pricePerHour"
                  type="number"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  className="block w-full pl-10 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Salvar Alterações
            </button>
          </form>
        </div>

        {/* Gerenciamento de Bloqueios */}
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Gerenciar Períodos Bloqueados
          </h2>

          {/* Formulário para adicionar novo bloqueio */}
          <form className="space-y-4 mb-8" onSubmit={handleBlockSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="blockStartTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Início do Bloqueio
                </label>
                <input
                  id="blockStartTime"
                  type="datetime-local"
                  value={blockStartTime}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                  className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  step="1800"
                />
              </div>
              <div>
                <label
                  htmlFor="blockEndTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Fim do Bloqueio
                </label>
                <input
                  id="blockEndTime"
                  type="datetime-local"
                  value={blockEndTime}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                  className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  step="1800"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="blockReason"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Motivo
              </label>
              <input
                id="blockReason"
                type="text"
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Manutenção"
                className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 cursor-pointer"
            >
              Adicionar Bloqueio
            </button>
          </form>

          {/* Lista de períodos bloqueados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-t pt-4">
              Períodos Atuais
            </h3>
            {resource?.Blocked && resource.Blocked.length > 0 ? (
              resource.Blocked.map((block) => (
                <div
                  key={block.id}
                  className="flex justify-between items-center bg-gray-200 dark:bg-gray-700 p-3 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {block.reason}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(block.blockedStart).toLocaleDateString('pt-BR')} -{' '}
                      {new Date(block.blockedEnd).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setIsDeleteBlockModalOpen(true);
                    }}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum período bloqueado.
              </p>
            )}
          </div>
        </div>

        {/* Zona de Perigo */}
        <div className="p-6 rounded-lg">
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full py-2 px-4 bg-orange-700 text-orange-100 border border-red-600 font-bold rounded-md hover:bg-red-100 dark:hover:bg-red-800 cursor-pointer"
          >
            Deletar Permanentemente este Recurso
          </button>
        </div>
      </div>
    </div>
  );
}
