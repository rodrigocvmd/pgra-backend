import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image"; // Importar o componente de Imagem do Next.js

interface Resource {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  pricePerHour: number;
  owner: {
    name: string | null;
  };
}

async function getResources(): Promise<Resource[]> {
  try {
    // Como este é um Server Component, a chamada é feita do lado do servidor.
    // O backend precisa estar rodando e acessível.
    const response = await api.get('/resource');
    return response.data;
  } catch (error) {
    console.error("Failed to fetch resources:", error);
    return []; // Retorna um array vazio em caso de erro
  }
}

export default async function Home() {
  const resources = await getResources();

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Recursos Disponíveis
      </h1>
      
      {resources.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum recurso encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {resources.map((resource) => (
            <Link href={`/resources/${resource.id}`} key={resource.id}>
              <div className="bg-white rounded-lg shadow-md h-full overflow-hidden hover:shadow-xl transition-shadow duration-200 cursor-pointer flex flex-col">
                <div className="relative w-full h-48">
                  <Image
                    src={resource.imageUrl || '/placeholder.png'}
                    alt={resource.name}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h2 className="text-2xl font-semibold mb-2">{resource.name}</h2>
                  <p className="text-sm text-gray-500 mb-2">
                    de {resource.owner?.name || 'Proprietário desconhecido'}
                  </p>
                  <p className="text-gray-600 mb-4 flex-grow">{resource.description || 'Sem descrição.'}</p>
                  <p className="text-xl font-bold text-right text-green-600 mt-auto">
                    R$ {Number(resource.pricePerHour).toFixed(2)} / hora
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
