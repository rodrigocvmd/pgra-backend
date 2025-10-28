"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Reservation {
  id: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'FINALIZADO';
  resource: {
    id: string;
    name: string;
  };
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Se a autenticação ainda está carregando, não faça nada.
    if (isAuthLoading) {
      return;
    }
    // Se não houver usuário após o carregamento, redirecione para o login.
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await api.get('/booking/me');
        setBookings(response.data);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        setError("Não foi possível carregar suas reservas.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, isAuthLoading, router]);

  if (isLoading || isAuthLoading) {
    return <div className="text-center p-8">Carregando reservas...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Minhas Reservas</h1>
      {bookings.length === 0 ? (
        <p>Você ainda não fez nenhuma reserva.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-lg">{booking.resource.name}</p>
                  <p className="text-sm text-gray-600">
                    De: {new Date(booking.startTime).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Até: {new Date(booking.endTime).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    R$ {Number(booking.totalPrice).toFixed(2)}
                  </p>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    booking.status === 'CONFIRMADO' ? 'bg-green-200 text-green-800' :
                    booking.status === 'PENDENTE' ? 'bg-yellow-200 text-yellow-800' :
                    'bg-red-200 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
