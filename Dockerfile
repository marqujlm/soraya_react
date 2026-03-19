# Estágio 1: Build da aplicação React
FROM node:20-alpine as build

WORKDIR /app

# Instala todas as dependências
COPY package*.json ./
RUN npm install

# Copia código fonte
COPY . .

# Build do React (sem depender do Cloud Build Arguments)
RUN npm run build

# Estágio 2: Nginx (Servidor Web Oficial Cloud Run)
FROM nginx:alpine

# Remove as configurações padrões do Nginx
RUN rm -rf /etc/nginx/conf.d/*

# Copia a configuração do template Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos minificados
COPY --from=build /app/dist /usr/share/nginx/html

# Copia e prepara o script injetor de Variáveis
COPY start.sh /start.sh
RUN chmod +x /start.sh

# O Google Cloud Run força a variável PORT (geralmente 8080)
EXPOSE 8080

# Inicia passando pelo script de substituição antes de abrir o nginx
ENTRYPOINT ["/start.sh"]
CMD ["nginx", "-g", "daemon off;"]

