## API Endpoints

A seguir estão os endpoints disponíveis na API.

### 1. Registro de Usuário

Registra um novo usuário no sistema.

- **URL:** `/auth/signup`
- **Método:** `POST`
- **Corpo da Requisição (Request Body):**
{
  "name": "Nome Completo do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senhaSuperSegura123",
  "role": "USER"
}

### 2. Login de Usuário

Autentica um usuário existente e, em caso de sucesso, retorna um token de acesso JWT.

- **URL:** `/auth/signin`
- **Método:** `POST`
- **Corpo da Requisição (Request Body):**
{
  "email": "usuario@exemplo.com",
  "password": "senhaSuperSegura123"
}