-- Database initialization script
-- This script will run when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- You can add any additional database setup here
-- For example, creating additional users, setting permissions, etc.

-- The actual tables will be created by Prisma migrations 