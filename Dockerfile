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

# Remove as configurações padrões do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia nossa configuração de segurança em formato de template
COPY nginx.template.conf /etc/nginx/conf.d/

# Copia os arquivos minificados do estágio de build para o servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia o script de inicialização
COPY start.sh /start.sh
RUN chmod +x /start.sh

# A porta dinâmica do Railway (se não houver, usará a 80 por causa do script)
EXPOSE 80

# Inicia passando pelo script que injeta o $PORT real no arquivo do Nginx
ENTRYPOINT ["/start.sh"]
CMD ["nginx", "-g", "daemon off;"]