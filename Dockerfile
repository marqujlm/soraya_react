# ==========================================
# Estágio 1: Build da aplicação React/Vite
# ==========================================
FROM node:20-alpine as build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (aproveita o cache do Docker)
COPY package*.json ./

# Instala as dependências de forma limpa
RUN npm ci --legacy-peer-deps

# Copia o restante do código da aplicação
COPY . .

# Faz o build de produção (gera a pasta /dist)
RUN npm run build

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