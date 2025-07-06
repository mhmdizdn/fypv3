# DigitalOcean Automated Deployment Guide

This guide will help you set up automated deployment of your Next.js application to DigitalOcean using GitHub Actions.

## 🚀 Quick Setup

### 1. Server Setup (One-time)

Connect to your DigitalOcean droplet and run the setup script:

```bash
# Download and run the setup script
curl -o setup-server.sh https://raw.githubusercontent.com/yourusername/yourrepo/main/setup-server.sh
chmod +x setup-server.sh
./setup-server.sh
```

### 2. Clone Your Repository

```bash
cd /opt/fypv3
git clone https://github.com/yourusername/yourrepo.git .
```

### 3. Configure Environment Variables

```bash
# Copy the template and edit
cp .env.template .env
nano .env

# Update these values:
# - DATABASE_URL: Your PostgreSQL connection string
# - NEXTAUTH_SECRET: A secure random string
# - NEXTAUTH_URL: Your droplet's public URL
# - POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB: Database credentials
```

### 4. GitHub Secrets Setup

In your GitHub repository, go to Settings → Secrets and variables → Actions, and add these secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `DO_HOST` | `188.166.219.104` | Your droplet's IP address |
| `DO_USERNAME` | `root` or your username | SSH username |
| `DO_SSH_KEY` | Contents of your private key | SSH private key from `C:\Users\izzud\.ssh\id_ed25519` |

### 5. Get Your SSH Private Key

On your local machine (Windows):

```powershell
# View your private key content
Get-Content C:\Users\izzud\.ssh\id_ed25519
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`) and paste it into the `DO_SSH_KEY` secret.

## 🔧 Manual Deployment (First Time)

Before automated deployment works, run the first deployment manually:

```bash
cd /opt/fypv3
chmod +x deploy.sh
./deploy.sh
```

## 🔄 Automated Deployment

Once set up, every push to the `main` branch will automatically:

1. ✅ Build the application
2. ✅ Run tests/linting
3. ✅ Deploy to your DigitalOcean droplet
4. ✅ Update the database
5. ✅ Restart services

## 📱 Accessing Your Application

After deployment, your app will be available at:
- **Direct:** http://188.166.219.104:3000
- **With Nginx:** http://188.166.219.104 (port 80)

## 🔍 Monitoring and Troubleshooting

### Check Application Status

```bash
# View running containers
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Check system resources
htop
df -h
```

### Common Issues

#### 1. **Out of Memory**
```bash
# Check memory usage
free -h

# Restart containers
cd /opt/fypv3
docker-compose -f docker-compose.prod.yml restart
```

#### 2. **Database Connection Issues**
```bash
# Check database logs
docker-compose -f docker-compose.prod.yml logs postgres

# Restart database
docker-compose -f docker-compose.prod.yml restart postgres
```

#### 3. **Build Failures**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild from scratch
docker-compose -f docker-compose.prod.yml up --build --force-recreate
```

## 🛠️ Environment Variables Reference

Create a `.env` file with these variables:

```env
# Database Configuration
DATABASE_URL="postgresql://fypuser:fyppassword@localhost:5432/fypdb"
POSTGRES_USER=fypuser
POSTGRES_PASSWORD=fyppassword
POSTGRES_DB=fypdb

# NextAuth Configuration
NEXTAUTH_SECRET=your_secure_random_string_here
NEXTAUTH_URL=http://188.166.219.104:3000

# Application Settings
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 🔐 Security Best Practices

1. **Firewall Configuration** (Already set up by setup script):
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 3000 (Application)
   - Port 5432 (PostgreSQL - for external access if needed)

2. **Environment Variables**: Never commit `.env` files to Git

3. **SSH Keys**: Use key-based authentication instead of passwords

4. **Database**: Use strong passwords and consider restricting database access

## 🚨 Emergency Procedures

### Quick Rollback
```bash
cd /opt/fypv3
git log --oneline -n 5  # Find previous commit
git checkout <previous-commit-hash>
./deploy.sh
```

### Stop All Services
```bash
cd /opt/fypv3
docker-compose -f docker-compose.prod.yml down
```

### Start All Services
```bash
cd /opt/fypv3
docker-compose -f docker-compose.prod.yml up -d
```

## 📞 Support

If you encounter issues:

1. Check the application logs
2. Verify environment variables
3. Ensure all secrets are properly set in GitHub
4. Check DigitalOcean droplet resources (CPU, Memory, Disk)

Happy deploying! 🎉 