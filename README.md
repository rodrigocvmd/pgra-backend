# Plataforma de Gestão e Reserva de Ativos (PGRA) - API Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)

API RESTful completa para um sistema de agendamento e reserva de recursos. Este projeto serve como o backend para uma aplicação onde usuários autenticados podem visualizar, criar, e gerenciar reservas de ativos (como salas de reunião, equipamentos, etc.), com uma lógica de negócio que previne conflitos de agendamento.

## 🚀 Sobre o Projeto

O PGRA foi desenvolvido como um projeto de portfólio para demonstrar competências essenciais em desenvolvimento backend moderno. A arquitetura segue os padrões modulares do Nest.js, garantindo um código organizado, escalável e de fácil manutenção. O projeto inclui um sistema robusto de autenticação e autorização, modelagem de dados relacional e um ambiente de desenvolvimento totalmente containerizado para garantir consistência e facilidade de setup.

## ✨ Features

* **Autenticação de Usuários:** Sistema completo de registro (`sign-up`) e login (`sign-in`) com senhas criptografadas (bcrypt).
* **Autorização com JWT:** Endpoints protegidos utilizando JSON Web Tokens, garantindo que apenas usuários autenticados possam interagir com a API.
* **CRUD de Usuários:** Operações para criar, visualizar, atualizar e deletar usuários.
* **CRUD de Recursos:** Gerenciamento completo dos ativos que podem ser reservados.
* **CRUD de Reservas:** Funcionalidade central para criar, visualizar, atualizar e deletar reservas.
* **Prevenção de Conflitos:** Lógica de negócio implementada no serviço de `Booking` que impede a criação de novas reservas se já existir uma para o mesmo recurso no mesmo intervalo de tempo.
* **Guards de Autorização:** Implementação de `Guards` do Nest.js para garantir que um usuário só possa modificar ou deletar suas próprias reservas.

## 🛠️ Tech Stack

* **Framework:** [Nest.js](https://nestjs.com/)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) (Local com Docker ou em nuvem com [Neon](https://neon.tech/))
* **ORM:** [Prisma](https://www.prisma.io/)
* **Autenticação:** [JWT](https://jwt.io/) & [Passport.js](http://www.passportjs.org/)
* **Validação de Dados:** `class-validator`, `class-transformer`
* **Containerização:** [Docker](https://www.docker.com/) & Docker Compose
* **Testes:** [Jest](https://jestjs.io/) (em desenvolvimento)

## ⚙️ Como Rodar o Projeto Localmente

Para executar este projeto no seu ambiente de desenvolvimento, siga os passos abaixo.

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) (v18 ou superior)
* [Docker](https://www.docker.com/products/docker-desktop/) e Docker Compose (para banco local)
* Uma conta no [Neon](https://neon.tech/) (para banco em nuvem - opcional)

### Instalação e Execução

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/rodrigocvmd/pgra-backend.git](https://github.com/rodrigocvmd/pgra-backend.git)
    cd pgra-backend
    ```

2.  **Crie o arquivo de variáveis de ambiente:**
    * Renomeie o arquivo `.env.example` para `.env`.
    * Preencha as variáveis de ambiente necessárias.
    * **Para Neon (Nuvem):** Use o `DATABASE_URL` (com pooler) e `DIRECT_URL` do dashboard do Neon.
    * **Para Docker (Local):** O valor da `DATABASE_URL` no arquivo de exemplo já está configurado para funcionar com o Docker Compose.

3.  **Configurar o Banco de Dados:**
    * **Opção A: Docker (Local):**
      ```bash
      docker-compose up -d --build
      docker-compose exec api npx prisma migrate dev
      ```
    * **Opção B: Neon (Nuvem):**
      ```bash
      npm install
      npx prisma db push
      ```

A API estará disponível em `http://localhost:3000`. Você pode agora utilizar uma ferramenta como o [Insomnia](https://insomnia.rest/) ou [Postman](https://www.postman.com/) para interagir com os endpoints.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE.md) para mais detalhes.