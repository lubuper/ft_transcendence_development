#!/bin/sh

while ! nc -z transcendence_db 5432; do
  echo "Waiting for database to be ready..."
  sleep 2
done

echo "Database is up"
exec "$@"
