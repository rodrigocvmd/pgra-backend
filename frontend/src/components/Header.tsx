"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

const Header = () => {
  const { user, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderNavLinks = (isMobile: boolean) => (
    <>
      {/* Links para todos os usuários logados */}
      <Link href="/" className={`${isMobile ? 'block py-2 px-4' : ''} text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white`}>
        Reservar um Recurso
      </Link>
      <Link href="/bookings/me" className={`${isMobile ? 'block py-2 px-4' : ''} text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white`}>
        Minhas Reservas
      </Link>

      {/* Links para Meus Recursos */}
      {user && (
        <Link href="/resources/me" className={`${isMobile ? 'block py-2 px-4' : ''} text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white`}>
          Meus Recursos
        </Link>
      )}
    </>
  );

  const renderAuthLinks = (isMobile: boolean) => (
    <>
      {user ? (
        <div className={`${isMobile ? 'border-t mt-2 pt-2' : 'border-l pl-4 ml-4'} border-gray-200 dark:border-gray-700 flex items-center ${isMobile ? '' : 'space-x-4'}`}>
          <span className={`${isMobile ? 'block py-2 px-4' : ''} text-gray-600 dark:text-gray-300`}>
            Bem-vindo(a),{' '}
            <Link href="/profile/me" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">
              {user.name || user.email}
            </Link>
          </span>
        </div>
      ) : (
        <>
          <Link href="/login" className={`${isMobile ? 'block py-2 px-4' : ''} text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white`}>
            Login
          </Link>
          <Link
            href="/register"
            className={`${isMobile ? 'block py-2 px-4' : ''} px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded`}
          >
            Cadastre-se
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
          Reserva de Locais e Recursos
        </Link>

        {/* Hamburger Button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg className="w-6 h-6 text-gray-800 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {!isLoading && renderNavLinks(false)}
          {!isLoading && renderAuthLinks(false)}
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 py-2">
          {!isLoading && renderNavLinks(true)}
          {!isLoading && renderAuthLinks(true)}
        </div>
      )}
    </header>
  );
};

export default Header;
