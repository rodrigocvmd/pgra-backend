"use client";

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@/components/ConfirmationModal';

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
  const [showCancelled, setShowCancelled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: string; action: 'CONFIRMADO' | 'CANCELADO' } | null>(null);
  const { user } = useAuth();
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
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      router.push('/');
      return;
    }
    fetchBookings();
  }, [user, router, fetchBookings]);

  const handleActionClick = (id: string, action: 'CONFIRMADO' | 'CANCELADO') => {
    setSelectedBooking({ id, action });
    setIsModalOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedBooking) return;
    try {
      const endpoint = selectedBooking.action === 'CONFIRMADO' ? 'confirm' : 'cancel';
      await api.patch(`/booking/${selectedBooking.id}/${endpoint}`);
      fetchBookings();
    } catch (err) {
      console.error(`Failed to ${selectedBooking.action} booking:`, err);
    } finally {
      setIsModalOpen(false);
      setSelectedBooking(null);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Carregando reservas...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  const activeBookings = bookings.filter(b => b.status !== 'CANCELADO');
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELADO');

  const renderBookingList = (bookingList: Booking[]) => (
    <div className="space-y-4">
      {bookingList.map((booking) => (
        <div key={booking.id} className="bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <p className="font-bold text-gray-200 text-lg">{booking.resource.name}</p>
              <p className="text-sm text-gray-300">
                Reservado por: {booking.user.name || booking.user.email}
              </p>
              <p className="text-sm text-gray-300 mt-2">
                De: {new Date(booking.startTime).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-300">
                Até: {new Date(booking.endTime).toLocaleDateString('pt-BR')}
              </p>
            </div>
            
            <div className="text-center">
              <span className={`px-3 py-1 font-bold text-sm rounded-full ${
                booking.status === 'CONFIRMADO' ? 'bg-green-200 text-green-800' :
                booking.status === 'PENDENTE' ? 'bg-yellow-200 text-yellow-700' :
                booking.status === 'FINALIZADO' ? 'bg-blue-200 text-blue-800' :
                'bg-red-200 text-red-800'
              }`}>
                {booking.status}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4 sm:mt-0">
              {booking.status === 'PENDENTE' && (
                <button
                  onClick={() => handleActionClick(booking.id, 'CONFIRMADO')}
                  className="px-3 py-1 text-sm font-medium text-white bg-green-800 rounded-md hover:bg-green-600"
                >
                  Confirmar
                </button>
              )}
              {(booking.status === 'PENDENTE' || booking.status === 'CONFIRMADO') && (
                <button
                  onClick={() => handleActionClick(booking.id, 'CANCELADO')}
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
  );

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Gerenciar Reservas</h1>
      
      {activeBookings.length === 0 && cancelledBookings.length === 0 ? (
        <p>Nenhuma reserva foi feita para seus locais ainda.</p>
      ) : (
        <>
          {activeBookings.length > 0 ? (
            renderBookingList(activeBookings)
          ) : (
            <p>Nenhuma reserva ativa encontrada.</p>
          )}

          {cancelledBookings.length > 0 && (
            <div className="mt-8">
              <button
                onClick={() => setShowCancelled(!showCancelled)}
                className="w-full flex justify-between items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
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
        title={selectedBooking?.action === 'CONFIRMADO' ? 'Confirmar Reserva' : 'Confirmar Cancelamento'}
        message={`Tem certeza que deseja ${selectedBooking?.action === 'CONFIRMADO' ? 'confirmar' : 'cancelar'} esta reserva?`}
        onConfirm={confirmAction}
        onCancel={() => setIsModalOpen(false)}
        variant={selectedBooking?.action === 'CONFIRMADO' ? 'success' : 'danger'}
        confirmButtonText={selectedBooking?.action === 'CONFIRMADO' ? 'Sim, confirmar esta reserva' : 'Sim, cancelar esta reserva'}
        cancelButtonText={selectedBooking?.action === 'CONFIRMADO' ? 'Não confirmar a reserva' : 'Não, manter reserva'}
      />
    </div>
  );
}
