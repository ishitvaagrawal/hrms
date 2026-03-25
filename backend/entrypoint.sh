#!/bin/bash
set -e

# Robust extraction using Python (since it's already in the image)
DB_HOST=$(python3 -c "from urllib.parse import urlparse; import os; print(urlparse(os.environ['DATABASE_URL']).hostname or '')")
DB_PORT=$(python3 -c "from urllib.parse import urlparse; import os; print(urlparse(os.environ['DATABASE_URL']).port or 5432)")

echo "Waiting for database at $DB_HOST:$DB_PORT..."

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "Database is up - starting application"

exec "$@"
