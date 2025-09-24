# Usa uma imagem oficial do Node.js como base.
FROM node:18-alpine

# Define o diretório de trabalho dentro do container.
WORKDIR /usr/src/app

# Copia os arquivos de dependência.
# O `package-lock.json` é importante para consistência.
COPY package*.json ./

# Instala as dependências do projeto.
RUN npm install

# Copia o restante do código para o diretório de trabalho.
COPY . .

# Constrói o projeto Nest.js para produção.
RUN npm run build

# O comando para rodar a aplicação quando o container iniciar.
CMD ["node", "dist/main.js"]