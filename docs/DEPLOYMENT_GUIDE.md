# Deployment Guide

## Overview
This guide provides comprehensive instructions for deploying the Fashion Dashboard across different environments and platforms.

## Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (v8+) or yarn (v1.22+)
- **Memory**: Minimum 512MB RAM
- **Storage**: At least 1GB free space
- **Network**: HTTPS-capable hosting environment

### Development Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify installation
node --version  # Should be 18.0+
npm --version   # Should be 8.0+
```

## Environment Configuration

### 1. Environment Variables
Create environment-specific configuration files:

#### `.env.local` (Development)
```env
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Configuration
API_BASE_URL=http://localhost:3000/api
DATA_SOURCE_PATH=./enhanced_fashion_data.csv

# Security
JWT_SECRET=your-development-jwt-secret
ENCRYPTION_KEY=your-development-encryption-key

# Database (Future)
DATABASE_URL=postgresql://user:password@localhost:5432/fashion_dashboard

# External APIs
INSTAGRAM_API_KEY=your-instagram-api-key
TIKTOK_API_KEY=your-tiktok-api-key
```

#### `.env.production` (Production)
```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# API Configuration
API_BASE_URL=https://your-domain.com/api
DATA_SOURCE_PATH=/app/data/enhanced_fashion_data.csv

# Security
JWT_SECRET=your-production-jwt-secret-256-bits
ENCRYPTION_KEY=your-production-encryption-key-256-bits

# Database
DATABASE_URL=postgresql://user:password@db-host:5432/fashion_dashboard

# External APIs
INSTAGRAM_API_KEY=your-production-instagram-api-key
TIKTOK_API_KEY=your-production-tiktok-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
ANALYTICS_ID=your-analytics-id
```

### 2. Build Configuration
Update `next.config.js` for production:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['www.instagram.com', 'www.tiktok.com', 'substack.com'],
  },
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Deployment Options

### Option 1: Vercel (Recommended)

#### 1. Vercel Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### 2. Vercel Configuration
Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 3. Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all production environment variables

### Option 2: Railway

#### 1. Railway Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up
```

#### 2. Railway Configuration
Create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option 3: AWS (Enterprise)

#### 1. AWS Amplify
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS
aws configure

# Deploy with Amplify
amplify init
amplify add hosting
amplify publish
```

#### 2. AWS Lambda + API Gateway
```yaml
# serverless.yml
service: fashion-dashboard

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production

functions:
  api:
    handler: app/api/index.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-nextjs-plugin
```

### Option 4: Docker Deployment

#### 1. Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

#### 2. Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/fashion_dashboard
    depends_on:
      - db
    volumes:
      - ./data:/app/data

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=fashion_dashboard
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## Database Setup

### 1. PostgreSQL (Recommended)
```sql
-- Create database
CREATE DATABASE fashion_dashboard;

-- Create user
CREATE USER fashion_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fashion_dashboard TO fashion_user;

-- Create tables
CREATE TABLE content (
  id SERIAL PRIMARY KEY,
  category VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  source VARCHAR(100) NOT NULL,
  time_spent_minutes DECIMAL(5,2),
  upvotes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  engagement_score DECIMAL(3,2),
  content_type VARCHAR(100),
  difficulty_level VARCHAR(50),
  trending_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_source ON content(source);
CREATE INDEX idx_content_engagement ON content(engagement_score);
```

### 2. Data Migration
```typescript
// Migration script
import { Pool } from 'pg'
import fs from 'fs'
import csv from 'csv-parser'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function migrateData() {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    // Read CSV data
    const data = []
    fs.createReadStream('enhanced_fashion_data.csv')
      .pipe(csv())
      .on('data', (row) => data.push(row))
      .on('end', async () => {
        // Insert data
        for (const row of data) {
          await client.query(`
            INSERT INTO content (
              category, url, source, time_spent_minutes, upvotes, 
              views, engagement_score, content_type, difficulty_level, trending_score
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            row.Category, row.URL, row.Source, row.Time_Spent_Minutes,
            row.Upvotes, row.Views, row.Engagement_Score, row.Content_Type,
            row.Difficulty_Level, row.Trending_Score
          ])
        }
        
        await client.query('COMMIT')
        console.log('Data migration completed')
      })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('Migration failed:', error)
  } finally {
    client.release()
  }
}
```

## Monitoring and Logging

### 1. Application Monitoring
```typescript
// Monitoring setup
import { createLogger, format, transports } from 'winston'

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
    new transports.Console({
      format: format.simple()
    })
  ]
})

export default logger
```

### 2. Health Check Endpoint
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    // Check external APIs
    // Check system resources
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime()
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: error.message },
      { status: 500 }
    )
  }
}
```

### 3. Performance Monitoring
```typescript
// Performance monitoring
import { performance } from 'perf_hooks'

export function withPerformanceMonitoring(handler: Function) {
  return async (req: Request, res: Response) => {
    const start = performance.now()
    
    try {
      const result = await handler(req, res)
      const duration = performance.now() - start
      
      logger.info('Request completed', {
        duration,
        url: req.url,
        method: req.method
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      
      logger.error('Request failed', {
        duration,
        url: req.url,
        method: req.method,
        error: error.message
      })
      
      throw error
    }
  }
}
```

## Security Hardening

### 1. SSL/TLS Configuration
```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
}
```

### 2. Firewall Configuration
```bash
# UFW firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## Backup and Recovery

### 1. Database Backup
```bash
#!/bin/bash
# Backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="fashion_dashboard_backup_$DATE.sql"

pg_dump $DATABASE_URL > $BACKUP_FILE
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://your-backup-bucket/
```

### 2. Application Backup
```bash
#!/bin/bash
# Application backup
tar -czf fashion_dashboard_$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

#### 2. Runtime Errors
```bash
# Check logs
docker logs container_name

# Debug mode
NODE_ENV=development npm run dev
```

#### 3. Performance Issues
```bash
# Analyze bundle size
npm run build
npx @next/bundle-analyzer

# Check memory usage
node --inspect server.js
```

## Maintenance

### 1. Regular Updates
```bash
# Update dependencies
npm update

# Security audit
npm audit
npm audit fix
```

### 2. Database Maintenance
```sql
-- Vacuum database
VACUUM ANALYZE;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

## Support

For deployment issues:
- Check the logs first
- Review this documentation
- Contact the development team
- Create an issue in the repository

