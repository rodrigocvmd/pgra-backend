'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          Plataforma de Reservas
        </Link>
        <div className="flex items-center space-x-4">
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : user ? (
            <>
              <span className="text-gray-600">Olá, {user.email}</span>
              {(user.role === 'OWNER' || user.role === 'ADMIN') && (
                <>
                  <Link
                    href="/resources/me"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Meus Recursos
                  </Link>
                  <Link
                    href="/owner/bookings"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Gerenciar Reservas
                  </Link>
                </>
              )}
              <Link
                href="/resources/create"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                + Cadastrar Recurso
              </Link>
              <Link
                href="/bookings/me"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Minhas Reservas
              </Link>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-gray-800">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Cadastre-se
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
