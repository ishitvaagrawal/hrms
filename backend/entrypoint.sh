#!/bin/bash
set -e

# Extract host and port from DATABASE_URL
# Expected format: postgresql+psycopg2://user:pass@host:port/dbname
# Robust extraction using sed
DB_HOST=$(echo "$DATABASE_URL" | sed -E 's/.*@([^:/?]+).*/\1/')
DB_PORT=$(echo "$DATABASE_URL" | sed -E 's/.*:([0-9]+)\/.*/\1/')

# Fallback to default postgres port if not found
if [[ ! "$DB_PORT" =~ ^[0-9]+$ ]]; then
  DB_PORT=5432
fi

echo "Waiting for database at $DB_HOST:$DB_PORT..."

while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done

echo "Database is up - starting application"

exec "$@"
