'use client';

import { useEffect, useState, useCallback, DragEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import CustomAlert from '@/components/CustomAlert';
import ConfirmationModal from '@/components/ConfirmationModal';
import { AxiosError } from 'axios';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // State para o formulário de bloqueio
  const [blockStartTime, setBlockStartTime] = useState('');
  const [blockEndTime, setBlockEndTime] = useState('');
  const [blockReason, setBlockReason] = useState('');

  // State de controle
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeletingBlock, setIsDeletingBlock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteBlockModalOpen, setIsDeleteBlockModalOpen] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user, token } = useAuth();

  const fetchResource = useCallback(async () => {
    if (id) {
      try {
        const response = await api.get(`/resource/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const resData = response.data;
        setResource(resData);
        setName(resData.name);
        setDescription(resData.description || '');
        setPricePerHour(String(resData.pricePerHour));
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(
            err.response?.data?.message ||
              'Não foi possível carregar o recurso.',
          );
        } else {
          setError('Não foi possível carregar o recurso.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [id, token]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchResource();
  }, [id, user, router, fetchResource]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !pricePerHour) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsUpdating(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('pricePerHour', pricePerHour);
    if (imageFile) {
      formData.append('file', imageFile);
    }

    try {
      await api.patch(`/resource/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      router.push('/resources/me');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message || 'Falha ao atualizar o recurso.',
        );
      } else {
        setError('Falha ao atualizar o recurso.');
      }
      setIsUpdating(false);
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

    setIsBlocking(true);
    try {
      await api.post(`/resource/${id}/block`, {
        blockedStart: new Date(blockStartTime).toISOString(),
        blockedEnd: new Date(blockEndTime).toISOString(),
        reason: blockReason,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchResource();
      setBlockStartTime('');
      setBlockEndTime('');
      setBlockReason('');
    } catch (err: unknown) {
      console.error('Failed to add block', err);
      if (err instanceof AxiosError) {
        setError(
          err.response?.data?.message ||
            'Falha ao adicionar período de bloqueio.',
        );
      } else {
        setError('Falha ao adicionar período de bloqueio.');
      }
    } finally {
      setIsBlocking(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    try {
      await api.delete(`/resource/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      router.push('/resources/me');
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Falha ao deletar o recurso.');
      } else {
        setError('Falha ao deletar o recurso.');
      }
      setIsDeleting(false);
    }
  };

  const handleDeleteBlock = async () => {
    if (selectedBlockId) {
      setIsDeleteBlockModalOpen(false);
      setIsDeletingBlock(true);
      try {
        await api.delete(`/resource/block/${selectedBlockId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        await fetchResource(); // Recarrega os dados do recurso
      } catch (err: unknown) {
        if (err instanceof AxiosError) {
          setError(
            err.response?.data?.message ||
              'Falha ao remover o período de bloqueio.',
          );
        } else {
          setError('Falha ao remover o período de bloqueio.');
        }
      } finally {
        setIsDeletingBlock(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-xl font-medium text-gray-700 dark:text-gray-300">Carregando recurso...</div>
      </div>
    );
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
                disabled={isUpdating}
                onChange={(e) => setName(e.target.value)}
                className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                disabled={isUpdating}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Imagem do Recurso (Opcional)
              </label>
              {imagePreview || resource?.imageUrl ? (
                <div className="mt-2 text-center">
                  <img
                    src={imagePreview || resource?.imageUrl || ''}
                    alt="Pré-visualização da imagem"
                    className="w-full h-auto max-h-64 object-contain rounded-md"
                  />
                  <label
                    htmlFor="image"
                    className={`mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-500 ${isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    Trocar imagem
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      disabled={isUpdating}
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                      : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                  } ${isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="image"
                        className={`relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <span>Clique para carregar um arquivo</span>
                        <input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          disabled={isUpdating}
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ou arraste e solte
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF, WEBP de até 10MB
                    </p>
                  </div>
                </div>
              )}
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
                  disabled={isUpdating}
                  onChange={(e) => setPricePerHour(e.target.value)}
                  className="block w-full pl-10 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isUpdating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando Alterações...
                </>
              ) : 'Salvar Alterações'}
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
                  disabled={isBlocking}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                  className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                  disabled={isBlocking}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                  className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
                disabled={isBlocking}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Ex: Manutenção"
                className="block w-full mt-1 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>
            <button
              type="submit"
              disabled={isBlocking}
              className="w-full py-2 px-4 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isBlocking ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adicionando Bloqueio...
                </>
              ) : 'Adicionar Bloqueio'}
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
                      {new Date(block.blockedStart).toLocaleDateString('pt-BR')}{' '}
                      - {new Date(block.blockedEnd).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setIsDeleteBlockModalOpen(true);
                    }}
                    disabled={isDeletingBlock && selectedBlockId === block.id}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isDeletingBlock && selectedBlockId === block.id ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Removendo...
                      </>
                    ) : 'Remover'}
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
            disabled={isDeleting}
            className="w-full py-2 px-4 bg-orange-700 text-orange-100 border border-red-600 font-bold rounded-md hover:bg-red-100 dark:hover:bg-red-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deletando Recurso...
              </>
            ) : 'Deletar Permanentemente este Recurso'}
          </button>
        </div>
      </div>
    </div>
  );
}
