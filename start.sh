#!/bin/sh
export PORT="${PORT:-80}"
envsubst "\$PORT" < /etc/nginx/conf.d/nginx.template.conf > /etc/nginx/conf.d/default.conf
exec "$@"

