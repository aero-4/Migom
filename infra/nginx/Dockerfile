FROM nginx:latest

COPY nginx.test.conf.template /etc/nginx/nginx.test.conf.template
COPY nginx.dev.conf.template /etc/nginx/nginx.dev.conf.template
COPY nginx.prod.conf.template /etc/nginx/nginx.prod.conf.template

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

WORKDIR /

ENTRYPOINT ["/entrypoint.sh"]
