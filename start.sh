#!/bin/sh
# Sem o set -e, se um comando find ou sed falhar porque os arquivos não mudaram, o container não morre.

echo "Iniciando injecao de configuracoes..."

# Forca imediatamente a criacao da config do Nginx com a Porta dinamica que o Cloud Run manda no boot
export PORT="${PORT:-8080}"
envsubst "\$PORT" < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Substitui as variaveis ocultas do backend no arquivo do Nginx que acabou de ser criado
sed -i "s|VITE_GEMINI_API_KEY_PLACEHOLDER|${VITE_GEMINI_API_KEY}|g" /etc/nginx/conf.d/default.conf || true

echo "Injetando variáveis de ambiente Firebase no Frontend React..."
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_API_KEY_PLACEHOLDER|${VITE_FIREBASE_API_KEY}|g" {} + || true
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_AUTH_DOMAIN_PLACEHOLDER|${VITE_FIREBASE_AUTH_DOMAIN}|g" {} + || true
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_PROJECT_ID_PLACEHOLDER|${VITE_FIREBASE_PROJECT_ID}|g" {} + || true
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_STORAGE_BUCKET_PLACEHOLDER|${VITE_FIREBASE_STORAGE_BUCKET}|g" {} + || true
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_MESSAGING_SENDER_ID_PLACEHOLDER|${VITE_FIREBASE_MESSAGING_SENDER_ID}|g" {} + || true
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_FIREBASE_APP_ID_PLACEHOLDER|${VITE_FIREBASE_APP_ID}|g" {} + || true

echo "Pronto! Inicializando o Nginx com o comando passado..."
exec "$@"

