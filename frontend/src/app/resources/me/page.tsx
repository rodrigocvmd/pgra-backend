"use client";

import { useEffect, useState, useCallback } from 'react';

import { useAuth } from '@/contexts/AuthContext';

import api from '@/lib/api';

import { useRouter } from 'next/navigation';

import Link from 'next/link';



interface Resource {

  id: string;

  name: string;

  description: string | null;

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

    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {

      router.push('/');

      return;

    }



    const fetchResources = async () => {

      try {

        const response = await api.get('/resource/me');

        setResources(response.data);

      } catch (err) {

        console.error("Failed to fetch resources:", err);

        setError("Não foi possível carregar seus recursos.");

      } finally {

        setIsLoading(false);

      }

    };



    fetchResources();

  }, [user, isAuthLoading, router]);



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

        <Link href="/resources/create" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">

          + Novo Recurso

        </Link>

      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {resources.length === 0 ? (

        <p>Você ainda não cadastrou nenhum recurso.</p>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {resources.map((resource) => (

            <div key={resource.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col">

              <div className="flex-grow">

                <h2 className="text-2xl font-semibold mb-2">{resource.name}</h2>

                <p className="text-gray-600 mb-4">{resource.description || 'Sem descrição.'}</p>

                                <p className="text-xl font-bold text-right text-green-600">

                                  R$ {Number(resource.pricePerHour).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / hora

                                </p>

              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end space-x-2">

                <Link href={`/resources/me/edit/${resource.id}`} className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600">

                  Editar

                </Link>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}
