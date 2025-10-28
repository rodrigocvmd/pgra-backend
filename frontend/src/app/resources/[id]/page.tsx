"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Resource {
  id: string;
  name: string;
  description: string | null;
  pricePerHour: number;
}

export default function ResourceDetailPage() {
  const [resource, setResource] = useState<Resource | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  
  const params = useParams();
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      const fetchResource = async () => {
        try {
          const response = await api.get(`/resource/${id}`);
          setResource(response.data);
        } catch (err) {
          console.error("Failed to fetch resource:", err);
          setError("Recurso não encontrado.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchResource();
    }
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!startTime || !endTime) {
      setBookingError("Por favor, preencha as datas de início e fim.");
      return;
    }

    try {
      const payload = {
        resourceId: id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };
      await api.post('/booking', payload);
      router.push('/bookings/me');
    } catch (err: any) {
      console.error("Failed to create booking:", err);
      setBookingError(err.response?.data?.message || "Não foi possível criar a reserva.");
    }
  };

  if (isLoading) return <div className="text-center p-8">Carregando recurso...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;
  if (!resource) return null;

  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Coluna de Informações */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{resource.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{resource.description || 'Sem descrição.'}</p>
          <p className="text-3xl font-bold text-green-600">
            R$ {Number(resource.pricePerHour).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / hora
          </p>
        </div>

        {/* Coluna do Formulário de Reserva */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Faça sua Reserva</h2>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Início da Reserva
              </label>
              <input
                type="datetime-local"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                Fim da Reserva
              </label>
              <input
                type="datetime-local"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            {bookingError && <p className="text-sm text-red-600">{bookingError}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reservar Agora
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}