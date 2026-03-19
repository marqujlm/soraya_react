FROM node:20-alpine

WORKDIR /app

# Copia os arquivos essenciais
COPY package*.json ./

# Instala as dependências limpas
RUN npm install

# Copia o resto do código fonte
COPY . .

# Faz o build do React pelo Vite
RUN npm run build

# Expõe a porta que o Google Cloud espera
EXPOSE 8080

# Inicia o servidor Node.js que é infalível para injetar chaves em runtime
CMD ["node", "server.js"]
