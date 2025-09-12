# SAGSIN Backend - Ubuntu-based
FROM ubuntu:22.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV APP_PORT=3000
ENV GRPC_URL=0.0.0.0:50051
ENV DATABASE_URL=mongodb://mongodb:27017/sagsin-db

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g npm@latest \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force
RUN npm i -g @nestjs/cli

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Expose ports
EXPOSE 3000 50051

# Start the application
CMD ["npm", "run", "start:prod"]