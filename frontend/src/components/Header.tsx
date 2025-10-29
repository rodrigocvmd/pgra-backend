"use client";

import Link from 'next/link';

import { useAuth } from '@/contexts/AuthContext';



const Header = () => {

  const { user, isLoading } = useAuth();



  return (

    <header className="bg-white dark:bg-gray-800 shadow-md">

      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">

        <Link href="/" className="text-2xl font-bold text-gray-800 dark:text-white">

          Plataforma de Reservas

        </Link>

        <div className="flex items-center space-x-8">

          {isLoading ? (

            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>

          ) : user ? (

            <>

                                          {/* Links para todos os usuários logados */}

                                          <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

                                            Reservar um Recurso

                                          </Link>

                                          <Link href="/bookings/me" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

                                            Minhas Reservas

                                          </Link>

                            

                                          {/* Links apenas para OWNERs e ADMINs */}

                                          {(user.role === 'OWNER' || user.role === 'ADMIN') && (

                                            <>

                                              <Link href="/resources/me" className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">

                                                Meus Recursos

                                              </Link>

                                            </>

                                          )}



                            {/* Links de Perfil */}



                            <div className="border-l border-gray-200 dark:border-gray-700 pl-4 flex items-center space-x-4">



                              <span className="text-gray-600 dark:text-gray-300">



                                Olá,{' '}



                                <Link href="/profile/me" className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500">



                                  {user.name || user.email}



                                </Link>



                              </span>



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

        </div>

      </nav>

    </header>

  );

};



export default Header;
