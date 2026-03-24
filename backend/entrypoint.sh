#!/bin/bash
set -e

# Extract host and port from DATABASE_URL
# Expected format: postgresql+psycopg2://user:pass@db:5432/dbname
DB_HOST=$(echo $DATABASE_URL | sed -e 's/.*@//' -e 's/:.*//')
DB_PORT=$(echo $DATABASE_URL | sed -e 's/.*://' -e 's/\/.*//')

echo "Waiting for database at $DB_HOST:$DB_PORT..."

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "Database is up - starting application"

exec "$@"
