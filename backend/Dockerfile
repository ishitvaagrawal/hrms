FROM python:3.13-slim

WORKDIR /app

# Install netcat for wait-for-db script
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Setup entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

# Expose port
EXPOSE 10000

# Run uvicorn using the PORT environment variable provided by Render
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"
