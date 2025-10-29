'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ConfirmationModal from '@/components/ConfirmationModal';

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
  const [showCancelled, setShowCancelled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const response = await api.get('/booking/me');
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Não foi possível carregar suas reservas.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [user, isAuthLoading, router, fetchBookings]);

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setIsModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedBookingId) return;
    try {
      await api.patch(`/booking/${selectedBookingId}/cancel`);
      fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Não foi possível cancelar a reserva.');
    } finally {
      setIsModalOpen(false);
      setSelectedBookingId(null);
    }
  };

  if (isLoading || isAuthLoading) {
    return <div className="text-center p-8">Carregando reservas...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  const activeBookings = bookings.filter((b) => b.status !== 'CANCELADO');
  const cancelledBookings = bookings.filter((b) => b.status === 'CANCELADO');

  const renderBookingList = (bookingList: Reservation[]) => (
    <div className="space-y-4">
      {bookingList.map((booking) => (
        <div
          key={booking.id}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-lg text-gray-900 dark:text-white">
                {booking.resource.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                De: {new Date(booking.startTime).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Até: {new Date(booking.endTime).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-right space-y-2">
              <p className="font-bold text-lg text-gray-600 dark:text-gray-100">
                R${' '}
                {Number(booking.totalPrice).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  booking.status === 'CONFIRMADO'
                    ? 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-gray-200'
                    : booking.status === 'PENDENTE'
                      ? 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-gray-200'
                      : booking.status === 'FINALIZADO'
                        ? 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-gray-200'
                        : 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-gray-200'
                }`}
              >
                {booking.status}
              </span>
            </div>
          </div>
          {(booking.status === 'PENDENTE' ||
            booking.status === 'CONFIRMADO') && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => handleCancelClick(booking.id)}
                className="px-3 py-1 text-sm font-medium text-gray-200 bg-orange-800 rounded-md hover:bg-red-600"
              >
                Cancelar Reserva
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Minhas Reservas
      </h1>

      {activeBookings.length === 0 && cancelledBookings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          Você ainda não possui reservas. Faça uma:{' '}
          <Link href="/" className="text-blue-600 hover:underline">
            Locais e Recursos Disponíveis
          </Link>
        </p>
      ) : (
        <>
          {activeBookings.length > 0 ? (
            renderBookingList(activeBookings)
          ) : (
            <p className="text-gray-600 dark:text-gray-400">
              Nenhuma reserva ativa encontrada.
            </p>
          )}

          {cancelledBookings.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowCancelled(!showCancelled)}
                className="w-full flex justify-between items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mb-4"
              >
                <span className="font-semibold">
                  {showCancelled ? 'Ocultar' : 'Mostrar'} Reservas Canceladas ({cancelledBookings.length})
                </span>
                <svg
                  className={`w-5 h-5 transform transition-transform ${showCancelled ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {showCancelled && renderBookingList(cancelledBookings)}
            </div>
          )}
        </>
      )}
      <ConfirmationModal
        isOpen={isModalOpen}
        title="Confirmar Cancelamento"
        message="Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita."
        onConfirm={confirmCancel}
        onCancel={() => setIsModalOpen(false)}
        confirmButtonText="Sim, Cancelar"
      />
    </div>
  );
}
