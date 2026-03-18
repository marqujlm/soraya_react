# Estágio 1: Build da aplicação React
FROM node:20-alpine as build

WORKDIR /app

# Instala todas as dependências (mesmo as de dev necessárias para o build)
COPY package*.json ./
RUN npm install

# Copia código fonte
COPY . .

# Argumentos enviados pelo Google Cloud Build/Run no momento de construção da imagem
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_API_DIFY
ARG VITE_ENDPOINT_DIFY

# Transfere os argumentos do Cloud Build para Variáveis do Vite durante o build
ENV VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
ENV VITE_FIREBASE_AUTH_DOMAIN=${VITE_FIREBASE_AUTH_DOMAIN}
ENV VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}
ENV VITE_FIREBASE_STORAGE_BUCKET=${VITE_FIREBASE_STORAGE_BUCKET}
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=${VITE_FIREBASE_MESSAGING_SENDER_ID}
ENV VITE_FIREBASE_APP_ID=${VITE_FIREBASE_APP_ID}
ENV VITE_API_DIFY=${VITE_API_DIFY}
ENV VITE_ENDPOINT_DIFY=${VITE_ENDPOINT_DIFY}

# Build do React
RUN npm run build

# Estágio 2: Nginx (Servidor Web Oficial Cloud Run)
FROM nginx:alpine

# Remove as configurações padrões do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia a configuração usando a pasta de templates do Nginx (suporte nativo Cloud Run via $PORT)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copia os arquivos minificados do estágio de build
COPY --from=build /app/dist /usr/share/nginx/html

# O Google Cloud Run força a variável PORT (geralmente 8080)
EXPOSE 8080

# Inicia o Nginx normalmente (que compila o template com a variável de ambiente)
CMD ["nginx", "-g", "daemon off;"]
