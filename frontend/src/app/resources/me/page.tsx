'use client';

import { useEffect, useState, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import api from '@/lib/api';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import Image from 'next/image';

interface Resource {
  id: string;

  name: string;

  description: string | null;

  imageUrl: string | null; // Adicionado imageUrl

  pricePerHour: number;
}

export default function MyResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [hasPendingBookings, setHasPendingBookings] = useState(false);

  const { user, token } = useAuth();

  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!user) {
      router.push('/');

      return;
    }

    const fetchResources = async () => {
      try {
        const response = await api.get('/resource/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setResources(response.data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);

        setError('Não foi possível carregar seus recursos.');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPendingBookings = async () => {
        if (user.role !== 'OWNER' && user.role !== 'ADMIN') return;
        try {
            const response = await api.get('/booking/my-resources-bookings?status=PENDENTE', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && response.data.length > 0) {
                setHasPendingBookings(true);
            }
        } catch (err) {
            console.error('Failed to fetch pending bookings', err);
        }
    }

    fetchResources();
    fetchPendingBookings();
  }, [user, token, router]);

  const prices = resources.map((r) => r.pricePerHour);

  const minPrice = Math.min(...prices);

  const maxPrice = Math.max(...prices);

  // Função para obter cor baseada no preço

  const getColorForPrice = (price: number) => {
    if (minPrice === maxPrice) {
      return 'rgb(0, 150, 0)'; // Padrão para verde escuro se todos os preços forem iguais
    }

    const percentage = (price - minPrice) / (maxPrice - minPrice);

    // Interpolar entre verde escuro (barato) e amarelo (caro)
    // Verde escuro RGB: 0, 150, 0
    // Amarelo RGB: 255, 255, 0

    const red = Math.round(255 * percentage);
    const green = Math.round(150 + (105 * percentage)); // 255 - 150 = 105
    const blue = 0;

    return `rgb(${red}, ${green}, ${blue})`;
  };

  if (isLoading) {
    return <div className="text-center p-8">Carregando seus recursos...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Meus Recursos</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {user && (user.role === 'OWNER' || user.role === 'ADMIN') && (
            <div className="relative">
              <Link
                href="/owner/bookings"
                className="bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold py-2 px-4 rounded cursor-pointer text-center block"
              >
                Gerenciar Reservas dos seus Recursos
              </Link>
              {hasPendingBookings && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
          )}

          <Link
            href="/resources/create"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer text-center"
          >
            + Novo Recurso
          </Link>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {resources.length === 0 ? (
        <p>Você ainda não cadastrou nenhum recurso.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <div
              key={resource.id}
              onClick={() => router.push(`/resources/${resource.id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer flex flex-col"
            >
              <div className="relative w-full h-48">
                <Image
                  src={resource.imageUrl || '/placeholder.png'}
                  alt={resource.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {resource.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                  {resource.description || 'Sem descrição.'}
                </p>
                <p
                  className="text-xl font-bold text-right mt-auto"
                  style={{ color: getColorForPrice(resource.pricePerHour) }}
                >
                  R${' '}
                  {Number(resource.pricePerHour).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{' '}
                  / hora
                </p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
                  <Link
                    href={`/resources/me/edit/${resource.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 cursor-pointer"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
