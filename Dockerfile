# Base on Node 18 LTS
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Next.js collects anonymous telemetry data - disable it
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_TYPESCRIPT_CHECK=0
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Expose the port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the development server (since production build is having issues)
CMD ["npm", "run", "dev"] 