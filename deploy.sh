#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check if .env file exists
if [ ! -f .env ]; then
    handle_error ".env file not found! Please create it with your environment variables."
fi

log_info "Loading environment variables..."
source .env

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || log_info "No containers to stop"

# Remove old images to free space
log_info "Cleaning up old Docker images..."
docker image prune -f || true

# Install/update dependencies
log_info "Installing dependencies..."
npm ci || handle_error "Failed to install dependencies"

# Generate Prisma client
log_info "Generating Prisma client..."
npx prisma generate || handle_error "Failed to generate Prisma client"

# Run database migrations
log_info "Running database migrations..."
npx prisma migrate deploy || handle_error "Failed to run database migrations"

# Build and start containers
log_info "Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build || handle_error "Failed to start containers"

# Wait for services to be ready
log_info "Waiting for services to start..."
sleep 30

# Check if application is running
log_info "Checking application health..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log_success "Application is running successfully!"
else
    handle_error "Application failed to start properly"
fi

# Show running containers
log_info "Running containers:"
docker-compose -f docker-compose.prod.yml ps

log_success "Deployment completed successfully! 🎉"
log_info "Application is available at: http://$(curl -s ifconfig.me):3000" 