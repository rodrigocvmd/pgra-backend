"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Booking {
  id: string;
  startTime: string;
  endTime: string;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'FINALIZADO';
  resource: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const fetchBookings = useCallback(async () => {
    try {
      const response = await api.get('/booking/my-resources-bookings');
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Não foi possível carregar as reservas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    fetchBookings();
  }, [user, isAuthLoading, router, fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, status: 'CONFIRMADO' | 'CANCELADO') => {
    try {
      const endpoint = status === 'CONFIRMADO' ? 'confirm' : 'cancel';
      await api.patch(`/booking/${bookingId}/${endpoint}`);
      // Atualiza a lista de reservas para refletir a mudança
      fetchBookings();
    } catch (err) {
      console.error(`Failed to ${status} booking:`, err);
      // Opcional: mostrar um erro mais específico para o usuário
    }
  };

  if (isLoading || isAuthLoading) {
    return <div className="text-center p-8">Carregando reservas...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Reservas</h1>
      {bookings.length === 0 ? (
        <p>Nenhuma reserva foi feita para seus recursos ainda.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Coluna 1: Detalhes do Recurso e Datas */}
                <div>
                  <p className="font-bold text-lg">{booking.resource.name}</p>
                  <p className="text-sm text-gray-700">
                    Reservado por: {booking.user.name || booking.user.email}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    De: {new Date(booking.startTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Até: {new Date(booking.endTime).toLocaleString()}
                  </p>
                </div>
                
                {/* Coluna 2: Status */}
                <div className="text-center">
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    booking.status === 'CONFIRMADO' ? 'bg-green-200 text-green-800' :
                    booking.status === 'PENDENTE' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>

                {/* Coluna 3: Ações */}
                <div className="flex justify-end space-x-2">
                  {booking.status === 'PENDENTE' && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'CONFIRMADO')}
                      className="px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                    >
                      Confirmar
                    </button>
                  )}
                  {(booking.status === 'PENDENTE' || booking.status === 'CONFIRMADO') && (
                    <button
                      onClick={() => handleUpdateStatus(booking.id, 'CANCELADO')}
                      className="px-3 py-1 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
                    >
                      {booking.status === 'PENDENTE' ? 'Recusar' : 'Cancelar'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
