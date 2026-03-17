# ==========================================
# Estágio 1: Build da aplicação React/Vite
# ==========================================
FROM node:20-alpine as build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (aproveita o cache do Docker)
COPY package*.json ./

# Instala as dependências de forma limpa
RUN npm ci

# Declarar os argumentos (o Railway precisa deles declarados AQUI para aceitá-los)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_API_DIFY
ARG VITE_ENDPOINT_DIFY

# Copia o restante do código da aplicação
COPY . .

# Em vez de passar os ARGs um por um (que pode falhar em alguns builders), 
# vamos garantir que o Docker crie as variáveis VITE no momento do build
# O Railway consegue injetar variaveis VITE se nós simplesmente executarmos o build
RUN VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY} \
    VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN} \
    VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID} \
    VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET} \
    VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID} \
    VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID} \
    VITE_API_DIFY=${VITE_API_DIFY} \
    VITE_ENDPOINT_DIFY=${VITE_ENDPOINT_DIFY} \
    npm run build

# ==========================================
# Estágio 2: Servidor Web Nginx (Produção)
# ==========================================
FROM nginx:alpine

# Remove as configurações padrões do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração de segurança e rotas do Nginx
COPY nginx.conf /etc/nginx/conf.d/

# Copia os arquivos minificados do estágio de build para o servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80, o Railway utilizará essa porta automaticamente
EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]