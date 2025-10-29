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
  const [filters, setFilters] = useState({
    availableFrom: '',
    availableTo: '',
    minPrice: '',
    maxPrice: '',
  });
  const [sort, setSort] = useState({
    sortBy: 'pricePerHour',
    sortOrder: 'asc',
  });
  const [error, setError] = useState<string | null>(null);

  const getResources = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.availableFrom) {
        const date = new Date(filters.availableFrom);
        params.append('availableFrom', date.toISOString());
      }
      if (filters.availableTo) {
        const date = new Date(filters.availableTo);
        params.append('availableTo', date.toISOString());
      }
      if (filters.minPrice)
        params.append(
          'minPrice',
          filters.minPrice.replace(/[^0-9,]/g, '').replace(',', '.'),
        );
      if (filters.maxPrice)
        params.append(
          'maxPrice',
          filters.maxPrice.replace(/[^0-9,]/g, '').replace(',', '.'),
        );
      if (sort.sortBy) params.append('sortBy', sort.sortBy);
      if (sort.sortOrder) params.append('sortOrder', sort.sortOrder);

      const response = await api.get(`/resource?${params.toString()}`);
      setResources(response.data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      setError('Failed to fetch resources. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getResources();
  }, []); // Fetch on initial load

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name === 'minPrice' || name === 'maxPrice') {
      const numericValue = value.replace(/[^0-9]/g, '');
      if (!numericValue) {
        setFilters((prev) => ({ ...prev, [name]: '' }));
        return;
      }
      const formattedValue = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(Number(numericValue) / 100);
      setFilters((prev) => ({ ...prev, [name]: formattedValue }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    const [sortBy, sortOrder] = value.split('-');
    setSort({ sortBy, sortOrder });
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    getResources();
  };

  const handleClearFilters = () => {
    setFilters({
      availableFrom: '',
      availableTo: '',
      minPrice: '',
      maxPrice: '',
    });
    setSort({ sortBy: 'pricePerHour', sortOrder: 'asc' });
    // Delay getResources to allow state to update
    setTimeout(getResources, 0);
  };

  // Find min and max prices for color gradient
  const prices = resources.map((r) => r.pricePerHour);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const getColorForPrice = (price: number) => {
    if (minPrice === maxPrice) return 'rgb(0, 255, 0)';
    const percentage = (price - minPrice) / (maxPrice - minPrice);
    const red = 255 * percentage;
    const green = 255;
    const blue = 0;
    return `rgb(${red}, ${green}, ${blue})`;
  };

  return (
    <main className="w-full p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        Locais Disponíveis
      </h1>

      <form
        onSubmit={handleFilterSubmit}
        className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-8 flex flex-wrap items-center gap-4"
      >
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="availableFrom"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Disponível de
          </label>
          <input
            type="date"
            name="availableFrom"
            value={filters.availableFrom}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="availableTo"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Até
          </label>
          <input
            type="date"
            name="availableTo"
            value={filters.availableTo}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label
            htmlFor="minPrice"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Preço Mín.
          </label>
          <input
            type="text"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="R$ 0,00"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label
            htmlFor="maxPrice"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Preço Máx.
          </label>
          <input
            type="text"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="R$ 1.000,00"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label
            htmlFor="sort"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Ordenar por
          </label>
          <select
            name="sort"
            value={`${sort.sortBy}-${sort.sortOrder}`}
            onChange={handleSortChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="pricePerHour-asc">Preço (Menor para Maior)</option>
            <option value="pricePerHour-desc">Preço (Maior para Menor)</option>
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Limpar
          </button>
        </div>
      </form>

      {isLoading ? (
        <div className="text-center p-8">Carregando locais...</div>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : resources.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Nenhum local ou recurso encontrado com os filtros aplicados.
        </p>
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
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {resource.name}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    por{' '}
                    {user?.id === resource.owner.id
                      ? 'Você'
                      : resource.owner?.name || 'Proprietário desconhecido'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow">
                    {resource.description || 'Sem descrição.'}
                  </p>
                  <p
                    className="text-xl font-bold text-right mt-auto"
                    style={{
                      color: getColorForPrice(resource.pricePerHour),
                    }}
                  >
                    R${' '}
                    {Number(resource.pricePerHour).toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    / hora
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