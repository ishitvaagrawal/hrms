# Use node 18 alpine as specified
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000
EXPOSE 3000

# Run in development mode
CMD ["npm", "run", "dev"]
