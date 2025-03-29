# CI/CD Setup for FreeReads

This document outlines the complete CI/CD pipeline setup for the FreeReads project.

## Table of Contents

- [Prerequisites](#prerequisites)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Render Deployment Setup](#render-deployment-setup)
- [Environment Configuration](#environment-configuration)
- [GitHub Actions CI/CD Pipeline](#github-actions-cicd-pipeline)
- [Redis Configuration](#redis-configuration)
- [Security Best Practices](#security-best-practices)

## Prerequisites

- Node.js and npm installed
- Git installed
- GitHub account
- MongoDB Atlas account
- Render account
- Upstash account (for Redis)

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas Cluster**:
   - Sign up or log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new project
   - Build a new cluster (the free tier works for development)
   - Choose your preferred cloud provider and region

2. **Configure Database Access**:
   - In the Security tab, create a new database user with read/write permissions
   - Set a secure password and save it for later use

3. **Configure Network Access**:
   - Add your current IP address to the IP access list
   - For deployment, add `0.0.0.0/0` to allow all IPs (or use Render's IP addresses)

4. **Get Your Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string, which looks like:
     ```
     mongodb+srv://<username>:<password>@<cluster-name>.<id>.mongodb.net/<database-name>?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your actual credentials
   - Add a database name after the hostname (e.g., `freereads`)

5. **Create a Test Database**:
   - Use the same connection string but change the database name:
     ```
     mongodb+srv://<username>:<password>@<cluster-name>.<id>.mongodb.net/freereads-test?retryWrites=true&w=majority
     ```

## Render Deployment Setup

1. **Create a New Web Service**:
   - Log in to [Render](https://render.com/)
   - Click "New" and select "Web Service"
   - Connect your GitHub repository
   - Configure your service:
     - Name: `freereads`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`

2. **Add Environment Variables**:
   - In your service's "Environment" tab, add all required environment variables:
     - `NODE_ENV=production`
     - `PORT=10000`
     - `MONGODB_URI=mongodb+srv://...` (your production connection string)
     - `JWT_SECRET=your-jwt-secret`
     - `GOOGLE_CREDENTIALS_BASE64=...` (your base64-encoded credentials)
     - `CORS_ORIGIN=https://your-frontend-domain.com`
     - All other required variables from your .env file

3. **Create render.yaml**:
   - Create a `render.yaml` file in your repository root:

```yaml
services:
  - type: web
    name: freereads
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: CORS_ORIGIN
        value: https://your-frontend-domain.com
      - key: JWT_SECRET
        sync: false
      - key: GOOGLE_CREDENTIALS_BASE64
        sync: false
      - key: REDIS_URL
        sync: false
      - key: REDIS_ENABLED
        value: true
      # Add all other environment variables here
```

## Environment Configuration

1. **Update env.js for Google Credentials**:
   - Modify your `src/config/env.js` file to handle Google credentials:

```javascript
import { config } from 'dotenv';
import fs from 'fs';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

// Handle Google credentials from base64 if provided
if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  try {
    const credentials = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
    fs.writeFileSync('./src/config/google-credentials.json', credentials);
    console.log('Google credentials file created from environment variable');
    // Set the path to the credentials file
    process.env.GOOGLE_CREDENTIALS = './src/config/google-credentials.json';
  } catch (error) {
    console.error('Failed to create Google credentials file:', error);
  }
}

export const ENV = {
    // Your environment variables...
};
```

2. **Create .env.example**:
   - Create a `.env.example` file in your repository:

```
# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.<id>.mongodb.net/<database-name>?retryWrites=true&w=majority

# Google
GOOGLE_CREDENTIALS=./src/config/google-credentials.json
GOOGLE_CREDENTIALS_BASE64=<base64-encoded-credentials>

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=1d

# Rate Limiting
TRUSTED_IPS=::1,127.0.0.1
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_STRICT=3
RATE_LIMIT_DEFAULT=5
RATE_LIMIT_AUTHENTICATED=10

# Slow Down
SLOW_DOWN_WINDOW_MS=60000
SLOW_DOWN_DELAY_AFTER=2
SLOW_DOWN_DELAY_MS=500

# Blacklist
BLACKLIST_PREFIX=blacklist
BLACKLIST_DURATION=86400
MAX_LOGIN_ATTEMPTS=3
MAX_API_ABUSE=10
ATTEMPT_RESET_TIME=3600

# Redis
REDIS_URL=redis://default:password@hostname:port
REDIS_ENABLED=true
```

## GitHub Actions CI/CD Pipeline

1. **Create Workflow Directory**:
   - Create a `.github/workflows` directory in your repository root:
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create CI/CD Workflow**:
   - Create a file named `ci-cd.yml` in the `.github/workflows` directory:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
      working-directory: ./WD-BE
    
    - name: Create test env file
      run: |
        echo "MONGODB_URI=${{ secrets.MONGODB_URI_TEST }}" > .env.test.local
        echo "GOOGLE_CREDENTIALS_BASE64=${{ secrets.GOOGLE_CREDENTIALS_BASE64 }}" >> .env.test.local
        echo "JWT_SECRET=${{ secrets.JWT_SECRET }}" >> .env.test.local
        echo "NODE_ENV=test" >> .env.test.local
        echo "REDIS_ENABLED=false" >> .env.test.local
      working-directory: ./WD-BE
    
    - name: Run tests
      run: npm test
      working-directory: ./WD-BE
      env:
        NODE_ENV: test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    
    steps:
    - name: Deploy to Render
      uses: johnbeynon/render-deploy-action@v0.0.8
      with:
        service-id: ${{ secrets.RENDER_SERVICE_ID }}
        api-key: ${{ secrets.RENDER_API_KEY }}
        clear-cache: true
```

3. **Set Up GitHub Secrets**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `MONGODB_URI_TEST`: Your MongoDB test connection string
     - `GOOGLE_CREDENTIALS_BASE64`: Your base64-encoded Google credentials
     - `JWT_SECRET`: Your JWT secret
     - `RENDER_SERVICE_ID`: Your Render service ID (from URL)
     - `RENDER_API_KEY`: Your Render API key (from Account Settings)

## Redis Configuration

1. **Set Up Upstash Redis**:
   - Sign up at [Upstash](https://upstash.com/)
   - Create a new Redis database
   - Get your Redis connection string

2. **Add Redis URL to Environment Variables**:
   - Add your Redis URL to Render environment variables
   - Format: `redis://default:password@hostname:port`

3. **Update Redis Configuration**:
   - Make sure your Redis client initialization handles valid URLs:

```javascript
// Ensure URL has protocol
const validateRedisUrl = (url) => {
  if (!url) return null;
  if (!url.startsWith('redis://') && !url.startsWith('rediss://')) {
    return `redis://${url}`;
  }
  return url;
};

// Use validated URL
const redisUrl = validateRedisUrl(ENV.REDIS_URL);
```

## Security Best Practices

1. **Rotate Credentials Regularly**:
   - Change your MongoDB password periodically
   - Rotate your Google service account keys
   - Update GitHub and Render secrets when credentials change

2. **Use Separate Test Database**:
   - Keep test data separate from production data
   - Use a different database name for tests

3. **Restrict Permissions**:
   - Give service accounts only the permissions they need
   - Use read-only access where possible

4. **Environment Variables**:
   - Never commit sensitive information to version control
   - Use environment variables for all sensitive configuration

5. **Monitor Logs**:
   - Regularly check your application logs
   - Set up alerts for unusual activity

## Troubleshooting

If you encounter issues:

1. **Check Render Logs**:
   - Go to your Render dashboard → Your service → Logs

2. **Verify GitHub Actions**:
   - Go to your GitHub repository → Actions tab

3. **Database Connection**:
   - Ensure MongoDB Atlas IP access list includes Render's IPs
   - Verify credentials are correct

4. **Redis Connection**:
   - Ensure your Redis URL is correctly formatted
   - Check that Upstash service is running
