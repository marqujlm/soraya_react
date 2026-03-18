#!/bin/sh
# Substitui os placeholders nos arquivos JS compilados pelas variáveis de ambiente reais do Cloud Run
echo "Injetando variáveis de ambiente em tempo de execução..."

find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_API_KEY_PLACEHOLDER|${VITE_FIREBASE_API_KEY}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_AUTH_DOMAIN_PLACEHOLDER|${VITE_FIREBASE_AUTH_DOMAIN}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_PROJECT_ID_PLACEHOLDER|${VITE_FIREBASE_PROJECT_ID}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_STORAGE_BUCKET_PLACEHOLDER|${VITE_FIREBASE_STORAGE_BUCKET}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER|${VITE_FIREBASE_MESSAGING_SENDER_ID}|g" {} +
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_APP_ID_PLACEHOLDER|${VITE_FIREBASE_APP_ID}|g" {} +

# Substitui as variáveis ocultas (Dify) diretamente no arquivo de configuração do Nginx (Backend)
sed -i "s|VITE_API_DIFY_PLACEHOLDER|${VITE_API_DIFY}|g" /etc/nginx/conf.d/default.conf
sed -i "s|VITE_ENDPOINT_DIFY_PLACEHOLDER|${VITE_ENDPOINT_DIFY}|g" /etc/nginx/conf.d/default.conf

echo "Inicializando o Nginx..."
exec "$@"

