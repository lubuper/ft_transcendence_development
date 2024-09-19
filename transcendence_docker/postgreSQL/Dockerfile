FROM postgres:16.4

COPY createdb.sql /docker-entrypoint-initdb.d/

#to check if script worked:
#docker run --name *container_name* -e POSTGRES_PASSWORD=admin -d *image_name*
#docker exec -it *container_name* bash
#psql -U admin -d transcendence_db
