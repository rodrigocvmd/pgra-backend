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

  const { user, isLoading: isAuthLoading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.push('/');

      return;
    }

    const fetchResources = async () => {
      try {
        const response = await api.get('/resource/me');

        setResources(response.data);
      } catch (err) {
        console.error('Failed to fetch resources:', err);

        setError('Não foi possível carregar seus recursos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [user, isAuthLoading, router]);

  const prices = resources.map((r) => r.pricePerHour);

  const minPrice = Math.min(...prices);

  const maxPrice = Math.max(...prices);

  // Function to get color based on price

  const getColorForPrice = (price: number) => {
    if (minPrice === maxPrice) {
      return 'rgb(0, 150, 0)'; // Default to darker green if all prices are the same
    }

    const percentage = (price - minPrice) / (maxPrice - minPrice);

    // Interpolate between darker green (cheap) and yellow (expensive)
    // Darker Green RGB: 0, 150, 0
    // Yellow RGB: 255, 255, 0

    const red = Math.round(255 * percentage);
    const green = Math.round(150 + (105 * percentage)); // 255 - 150 = 105
    const blue = 0;

    return `rgb(${red}, ${green}, ${blue})`;
  };

  if (isLoading || isAuthLoading) {
    return <div className="text-center p-8">Carregando seus recursos...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Meus Recursos</h1>

        <div className="flex space-x-4">
          {user && (user.role === 'OWNER' || user.role === 'ADMIN') && (
            <Link
              href="/owner/bookings"
              className="bg-gray-500 text-white rounded-md hover:bg-gray-600 font-bold py-2 px-4 rounded cursor-pointer"
            >
              Gerenciar Reservas dos seus Recursos
            </Link>
          )}

          <Link
            href="/resources/create"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer"
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
