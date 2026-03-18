# ==========================================
# Estágio 1: Build da aplicação React/Vite
# ==========================================
FROM node:20-alpine as build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (aproveita o cache do Docker)
COPY package*.json ./

# Instala as dependências de forma limpa
RUN npm run install

# Copia o restante do código da aplicação
COPY . .

# Argumentos (Variáveis de Ambiente preenchidas no painel do Railway)
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_API_DIFY
ARG VITE_ENDPOINT_DIFY

# Passando os ARGs para variáveis de ambiente ENV persistentes (essencial pro Vite/NPM enxergar na build!)
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_API_DIFY=$VITE_API_DIFY
ENV VITE_ENDPOINT_DIFY=$VITE_ENDPOINT_DIFY

# Print de debug no console do deploy do Railway (pra você ver se chegou vazio ou não lá nos logs)
RUN echo "DEBUG VITE_FIREBASE_PROJECT_ID=${VITE_FIREBASE_PROJECT_ID}"

# Faz o build de produção (agora os ENVs estão injetados no contexto)
RUN npm run build

# ==========================================
# Estágio 2: Servidor Web Nginx (Produção)
# ==========================================
FROM nginx:alpine

# Copia os arquivos minificados do estágio de build para o servidor Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copia a configuração usando a pasta mágica de templates do Nginx
# O Nginx Alpine substituirá a variável ${PORT} e gerará o arquivo real no boot
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Expor uma porta (Railway mapeará para a $PORT nativamente)
EXPOSE 80

# Inicia o Nginx normalmente (ele executa os templates antes sozinho)
CMD ["nginx", "-g", "daemon off;"]