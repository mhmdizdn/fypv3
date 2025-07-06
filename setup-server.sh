#!/bin/bash

# Server Setup Script for DigitalOcean Deployment
# Run this script on your DigitalOcean droplet for initial setup

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Setting up DigitalOcean droplet for automated deployment...${NC}"

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

# Update system packages
log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y || handle_error "Failed to update system packages"

# Install Docker
log_info "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    log_success "Docker installed successfully!"
else
    log_info "Docker is already installed"
fi

# Install Docker Compose
log_info "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose installed successfully!"
else
    log_info "Docker Compose is already installed"
fi

# Install Node.js and npm
log_info "Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js installed successfully!"
else
    log_info "Node.js is already installed"
fi

# Install Git
log_info "Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
    log_success "Git installed successfully!"
else
    log_info "Git is already installed"
fi

# Create application directory
log_info "Creating application directory..."
sudo mkdir -p /opt/fypv3
sudo chown $USER:$USER /opt/fypv3
cd /opt/fypv3

# Clone repository (you'll need to replace this with your repo URL)
log_info "Please clone your repository manually:"
echo -e "${YELLOW}cd /opt/fypv3${NC}"
echo -e "${YELLOW}git clone https://github.com/yourusername/yourrepo.git .${NC}"

# Create environment file template
log_info "Creating environment file template..."
cat > .env.template << EOF
# Database Configuration
DATABASE_URL="postgresql://fypuser:fyppassword@localhost:5432/fypdb"
POSTGRES_USER=fypuser
POSTGRES_PASSWORD=fyppassword
POSTGRES_DB=fypdb

# NextAuth Configuration
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://$(curl -s ifconfig.me):3000

# Application Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
EOF

log_success "Environment template created! Copy .env.template to .env and update values:"
echo -e "${YELLOW}cp .env.template .env${NC}"
echo -e "${YELLOW}nano .env${NC}"

# Set up firewall
log_info "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 5432/tcp
sudo ufw --force enable
log_success "Firewall configured!"

# Create swap file if not exists (helps with memory)
if [ ! -f /swapfile ]; then
    log_info "Creating swap file..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    log_success "Swap file created!"
fi

log_success "Server setup completed! 🎉"
echo -e "${BLUE}Next steps:${NC}"
echo -e "${YELLOW}1. Clone your repository to /opt/fypv3${NC}"
echo -e "${YELLOW}2. Copy and configure your .env file${NC}"
echo -e "${YELLOW}3. Set up GitHub secrets for automated deployment${NC}"
echo -e "${YELLOW}4. Push to main branch to trigger deployment${NC}" 