"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

interface Resource {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pricePerHour: number;
  owner: {
    id: string;
    name: string | null;
  };
}

export default function Home() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const getResources = async () => {
      try {
        const response = await api.get('/resource');
        setResources(response.data);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    getResources();
  }, []);

  if (isLoading) {
    return <div className="text-center p-8">Carregando recursos...</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        Recursos Disponíveis
      </h1>
      
      {resources.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">Nenhum recurso encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <Link href={`/resources/${resource.id}`} key={resource.id}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer flex flex-col">
                <div className="relative w-full h-48">
                  <Image
                    src={resource.imageUrl || '/placeholder.png'}
                    alt={resource.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{resource.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    por {user?.id === resource.owner.id ? "Você" : resource.owner?.name || 'Proprietário desconhecido'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">{resource.description || 'Sem descrição.'}</p>
                  <p className="text-xl font-bold text-right text-green-500 dark:text-green-400 mt-auto">
                    R$ {Number(resource.pricePerHour).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / hora
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}