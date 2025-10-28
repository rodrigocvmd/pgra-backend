import api from "@/lib/api";
import Link from "next/link";

interface Resource {
  id: string;
  name: string;
  description: string | null;
  pricePerHour: number;
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
              <div className="bg-white rounded-lg shadow-md p-6 h-full hover:shadow-xl transition-shadow duration-200 cursor-pointer">
                <h2 className="text-2xl font-semibold mb-2">{resource.name}</h2>
                <p className="text-gray-600 mb-4">{resource.description || 'Sem descrição.'}</p>
                <p className="text-xl font-bold text-right text-green-600">
                  R$ {Number(resource.pricePerHour).toFixed(2)} / hora
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
