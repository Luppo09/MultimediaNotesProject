FROM nginx:1.28.0-alpine3.21-perl

COPY . /usr/share/nginx/html

# Copia a configuração personalizada do nginx
COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 3000

