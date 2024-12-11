FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf

COPY ./etc/certs/self_signed_cert.pem /etc/nginx/ssl/self_signed_cert.pem
COPY ./etc/certs/self_signed_key.pem /etc/nginx/ssl/self_signed_key.pem

EXPOSE 80 443

# Set the default command to run NGINX
CMD ["nginx", "-g", "daemon off;"]