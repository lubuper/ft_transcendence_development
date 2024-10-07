#!/bin/sh

while ! nc -z transcendence_db 5432; do
  echo "Waiting for database to be ready..."
  sleep 2
done

echo "Database is up"

# Run database migrations
python3 manage.py migrate

# Create Django superuser
python3 manage.py shell << END
from django.contrib.auth import get_user_model
User = get_user_model()
username = 'admin'
password = 'admin'
email = ''
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
    print('Superuser created')
else:
    print('Superuser already exists')
END

exec "$@"
