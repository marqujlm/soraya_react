#!/bin/sh
# Substitui as variáveis de ambiente nos arquivos JS minificados (na pasta do Nginx)
# Isso permite que injetemos chaves do Firebase dinamicamente DEPOIS do build (no momento que o container liga no Railway)

echo "Iniciando injecao de variaveis de ambiente..."

find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_API_KEY_PLACEHOLDER|${VITE_FIREBASE_API_KEY}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_AUTH_DOMAIN_PLACEHOLDER|${VITE_FIREBASE_AUTH_DOMAIN}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_PROJECT_ID_PLACEHOLDER|${VITE_FIREBASE_PROJECT_ID}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_STORAGE_BUCKET_PLACEHOLDER|${VITE_FIREBASE_STORAGE_BUCKET}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER|${VITE_FIREBASE_MESSAGING_SENDER_ID}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_APP_ID_PLACEHOLDER|${VITE_FIREBASE_APP_ID}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_API_DIFY_PLACEHOLDER|${VITE_API_DIFY}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_ENDPOINT_DIFY_PLACEHOLDER|${VITE_ENDPOINT_DIFY}|g" {} +

# O Railway exige que a aplicação escute na porta que ele define via variável ambiente $PORT
PORT="${PORT:-80}"
echo "Configurando Nginx para escutar na porta ${PORT}..."
sed -i "s|PORT_PLACEHOLDER|${PORT}|g" /etc/nginx/conf.d/nginx.conf

echo "Variaveis injetadas. Iniciando Nginx..."

# Executa o Nginx (o "$@" repassa os comandos recebidos no Dockerfile)
exec "$@"

