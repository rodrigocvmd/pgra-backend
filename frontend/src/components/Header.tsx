"use client";

import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';

import ThemeSwitcher from './ThemeSwitcher';



const Header = () => {

  const { user, isLoading } = useAuth();



  return (

    <header className="bg-white dark:bg-gray-800 shadow-md">

      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">

        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white">

          Plataforma de Reservas

        </Link>

        <div className="flex items-center space-x-4">

          {isLoading ? (

            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>

          ) : user ? (

            <>

              {/* Links para todos os usuários logados */}

              <Link href="/bookings/me" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

                Minhas Reservas

              </Link>



              {/* Links apenas para OWNERs e ADMINs */}

              {(user.role === 'OWNER' || user.role === 'ADMIN') && (

                <>

                  <Link href="/resources/me" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

                    Meus Recursos

                  </Link>

                  <Link href="/owner/bookings" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

                    Gerenciar Reservas

                  </Link>

                </>

              )}



              {/* Links de Perfil */}

              <div className="border-l border-gray-200 dark:border-gray-700 pl-4 flex items-center space-x-4">

                <Link href="/profile/me" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

                  Meu Perfil

                </Link>

                <Link href="/profile/me" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">

                  Olá, {user.name || user.email}

                </Link>

              </div>

            </>

          ) : (

            <>

              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

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

          <ThemeSwitcher />

        </div>

      </nav>

    </header>

  );

};



export default Header;
