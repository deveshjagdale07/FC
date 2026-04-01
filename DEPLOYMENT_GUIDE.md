# Deployment Guide

Complete guide to deploy the Farmer to Customer Marketplace to production environments.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing locally
- [ ] No console.log statements in production code
- [ ] No hardcoded credentials
- [ ] All environment variables defined
- [ ] Code review completed

### Security
- [ ] JWT secret is strong (minimum 32 characters)
- [ ] CORS origin set to actual domain
- [ ] All user inputs validated
- [ ] Passwords hashed with appropriate salt rounds
- [ ] HTTPS enabled
- [ ] API rate limiting implemented

### Performance
- [ ] Database indexes created
- [ ] Images optimized
- [ ] Bundle size analyzed
- [ ] CDN configured for static assets
- [ ] Caching headers configured

### Documentation
- [ ] README updated with production instructions
- [ ] API documentation complete
- [ ] Deployment script created
- [ ] Rollback procedure documented

---

## Backend Deployment

### Option 1: Deploy to Heroku (Easiest)

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed
- Git initialized

#### Step 1: Install Heroku CLI
```bash
# Windows
choco install heroku-cli

# macOS
brew tap heroku/brew && brew install heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Step 2: Login to Heroku
```bash
heroku login
```

#### Step 3: Create Heroku App
```bash
cd backend
heroku create your-app-name
```

#### Step 4: Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_long_random_secret_here
heroku config:set JWT_EXPIRE=7d
heroku config:set PORT=5000
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
heroku config:set DATABASE_URL=mysql://user:password@host:port/dbname
heroku config:set MAX_FILE_SIZE=5242880
heroku config:set UPLOAD_PATH=/uploads
```

#### Step 5: Configure Procfile
Create `backend/Procfile`:
```
web: npm run dev
```

#### Step 6: Deploy
```bash
git push heroku main
```

#### Step 7: Run Database Migrations
```bash
heroku run npx prisma migrate deploy
```

#### Monitor Logs
```bash
heroku logs --tail
```

---

### Option 2: Deploy to AWS EC2

#### Step 1: Launch EC2 Instance
1. Go to AWS Console
2. Click EC2 Dashboard
3. Launch Instance
4. Choose: **Ubuntu Server 22.04 LTS** (t2.micro for free tier)
5. Configure Security Group:
   - Port 22 (SSH): Your IP
   - Port 5000: Anywhere (0.0.0.0)
   - Port 80: Anywhere
   - Port 443: Anywhere

#### Step 2: Connect to Instance
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### Step 3: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install MySQL client
sudo apt install -y mysql-client

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx
```

#### Step 4: Upload Code
```bash
# From your local machine
scp -i your-key.pem -r backend ubuntu@your-instance-ip:~/

# Or clone from GitHub
ssh -i your-key.pem ubuntu@your-instance-ip
git clone https://github.com/your-username/farmers-marketplace.git
cd farmers-marketplace/backend
```

#### Step 5: Install Node Dependencies
```bash
npm install
```

#### Step 6: Create .env File
```bash
sudo nano .env
```

Add:
```
NODE_ENV=production
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRE=7d
PORT=5000
DATABASE_URL=mysql://username:password@your-db-host:3306/farmersDB
FRONTEND_URL=https://your-frontend-domain.com
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/home/ubuntu/uploads
```

#### Step 7: Setup Database Connection
```bash
# Test connection
mysql -h your-db-host -u username -p -e "USE farmersDB; SHOW TABLES;"

# Run migrations
npx prisma migrate deploy
```

#### Step 8: Start with PM2
```bash
pm2 start npm --name "farmers-api" -- run dev
pm2 startup
pm2 save
```

#### Step 9: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/default
```

Replace content with:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name your-api-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 10: Enable SSL (HTTPS)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-api-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

#### Step 11: Verify
```bash
curl https://your-api-domain.com/api/products
```

---

### Option 3: Deploy to DigitalOcean

#### Step 1: Create Droplet
1. Go to DigitalOcean
2. Create Droplet (Ubuntu 22.04, $5/month)
3. Choose region closest to users
4. Add SSH key for security

#### Step 2: Connect
```bash
ssh root@your-droplet-ip
```

#### Step 3: Initial Setup
```bash
# Update
apt update && apt upgrade -y

# Create non-root user
useradd -m -s /bin/bash appuser
usermod -aG sudo appuser

# Switch to user
su - appuser
```

#### Step 4: Install Stack
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PM2
sudo npm install -g pm2

# Nginx
sudo apt install -y nginx

# MySQL (or use managed database)
sudo apt install -y mysql-client
```

#### Step 5-8: Follow EC2 steps 4-8 above

#### Step 9: Configure Firewall
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

#### Prerequisites
- Vercel account (free)
- Git repository (GitHub)

#### Step 1: Connect GitHub Repository
1. Go to vercel.com
2. Click "New Project"
3. Select your GitHub repository with frontend code
4. Choose "Create React App" as framework

#### Step 2: Set Environment Variables
1. Go to Project Settings → Environment Variables
2. Add:
   ```
   REACT_APP_API_URL=https://your-api-domain.com
   ```

#### Step 3: Configure Build
1. Framework: Create React App
2. Build Command: `npm run build`
3. Output Directory: `build`

#### Step 4: Deploy
Click "Deploy" - automatic deployment on every git push to main branch

#### Verify
```
https://your-project-name.vercel.app
```

---

### Option 2: Deploy to Netlify

#### Step 1: Connect Git Repository
1. Go to netlify.com
2. Click "New site from Git"
3. Connect GitHub account
4. Select repository

#### Step 2: Configure Build Settings
1. Base directory: `frontend`
2. Build command: `npm run build`
3. Publish directory: `build`

#### Step 3: Set Environment Variables
Site settings → Build & deploy → Environment
```
REACT_APP_API_URL=https://your-api-domain.com
```

#### Step 4: Deploy
Click deploy - will automatically build and deploy

---

### Option 3: Deploy to AWS S3 + CloudFront

#### Step 1: Build Frontend
```bash
cd frontend
npm run build
```

#### Step 2: Create S3 Bucket
1. AWS Console → S3
2. Create bucket: `your-app-frontend`
3. Enable Static website hosting
4. Block all public access ❌ (disable to allow public access)

#### Step 3: Configure Bucket
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-frontend/*"
    }
  ]
}
```

#### Step 4: Upload Files
```bash
aws s3 sync build/ s3://your-app-frontend/
```

#### Step 5: Create CloudFront Distribution
1. AWS CloudFront → Create Distribution
2. Origin: Your S3 bucket
3. Default Root Object: `index.html`
4. Enable compression

#### Step 6: Update DNS
Point your domain to CloudFront distribution URL

---

## Database Setup

### Option 1: AWS RDS (Managed MySQL)

#### Step 1: Create RDS Instance
1. AWS Console → RDS → Create Database
2. Engine: MySQL 8.0
3. DB Instance Class: db.t3.micro (free tier)
4. Credentials:
   ```
   Master username: admin
   Master password: [Strong random password]
   ```
5. Storage: 20 GB
6. Backup: 7 days

#### Step 2: Configure Security Groups
1. Inbound Rules:
   - Type: MySQL/Aurora
   - Port: 3306
   - Source: Your app server security group

#### Step 3: Get Connection Details
```
Endpoint: your-instance.xxxxx.us-east-1.rds.amazonaws.com
Port: 3306
Database: farmersDB
Username: admin
Password: [your password]
```

#### Step 4: Create Database
```bash
mysql -h your-instance.xxxxx.us-east-1.rds.amazonaws.com -u admin -p -e "CREATE DATABASE farmersDB;"
```

#### Step 5: Run Migrations
```bash
npx prisma migrate deploy
```

---

### Option 2: DigitalOcean Managed Database

#### Step 1: Create Managed Database
1. DigitalOcean → Create → Databases
2. Engine: MySQL 8.0
3. Region: Same as droplet
4. Plan: $15/month (recommended)

#### Step 2: Get Connection String
```
Connection: mysql://username:password@host:port/dbname
```

#### Step 3: Setup
```bash
# Run migrations
npx prisma migrate deploy

# Or load sample data
mysql -h host -u username -p farmersDB < SAMPLE_DATA.sql
```

---

## Environment Configuration

### Production .env Template

Create `backend/.env.production`:

```
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=mysql://user:password@host:port/farmersDB

# JWT
JWT_SECRET=your_very_long_random_secret_minimum_32_characters_abc123xyz789
JWT_EXPIRE=7d

# Frontend
FRONTEND_URL=https://your-frontend-domain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/var/uploads

# Email (optional for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment Gateway (optional)
STRIPE_SECRET_KEY=sk_live_your_key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

### Frontend .env Configuration

```
REACT_APP_API_URL=https://api.your-domain.com
REACT_APP_APP_NAME=Farmers Marketplace
REACT_APP_VERSION=1.0.0
```

---

## SSL/HTTPS Configuration

### Auto-renew Certificates
```bash
# Certbot auto-renewal (every 60 days)
sudo certbot renew --quiet

# Check renewal status
sudo certbot certificates
```

### Test SSL
```bash
curl -I https://your-domain.com
```

---

## Monitoring and Maintenance

### Application Health Checks

#### PM2 Monitoring
```bash
pm2 monit
pm2 logs farmers-api
pm2 status
```

#### Log Rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:retain 7
```

### Database Monitoring

#### Check Database Performance
```bash
# Login to MySQL
mysql -h host -u user -p farmersDB

# Check table sizes
SELECT table_name, ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'farmersDB';

# Check slow queries
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### Server Monitoring

#### Resource Usage
```bash
# Check CPU/Memory
top
htop

# Disk space
df -h
du -sh /home/username

# Network
netstat -an | grep ESTABLISHED
```

### Application Logs

#### Centralized Logging (Recommended)
```bash
# Install CloudWatch agent or similar
# Ensure logs are stored for debugging
```

---

## Backup and Recovery

### Database Backup

#### Automated Backups (RDS)
- AWS RDS automatically backs up daily
- Retention: 7 days
- Restore: 1 click in AWS console

#### Manual Backup
```bash
# Export database
mysqldump -h host -u user -p farmersDB > backup.sql

# Upload to S3
aws s3 cp backup.sql s3://your-backup-bucket/
```

#### Restore from Backup
```bash
mysql -h host -u user -p farmersDB < backup.sql
```

### File Backup

#### Backup Uploads
```bash
# For EC2/DigitalOcean
tar -czf uploads-backup.tar.gz /var/uploads/
aws s3 cp uploads-backup.tar.gz s3://your-backup-bucket/

# Schedule daily
0 2 * * * tar -czf /tmp/uploads-backup.tar.gz /var/uploads/ && aws s3 cp /tmp/uploads-backup.tar.gz s3://your-backup-bucket/
```

---

## Performance Optimization

### Database Optimization

```sql
-- Analyze tables
ANALYZE TABLE users;
ANALYZE TABLE products;
ANALYZE TABLE orders;

-- Check index usage
SHOW INDEX FROM products;

-- Add missing indexes
CREATE INDEX idx_createdAt ON products(createdAt);
CREATE INDEX idx_price ON products(price);
```

### Caching Strategy

#### Redis Caching (Optional)
```javascript
// In production setup
const redis = require('redis');
const client = redis.createClient();

// Cache product list
router.get('/products', async (req, res) => {
  const cached = await client.get('products');
  if (cached) return res.json(JSON.parse(cached));
  
  const products = await Product.findMany();
  await client.setEx('products', 3600, JSON.stringify(products));
  return res.json(products);
});
```

### Image Optimization

```bash
# Install ImageMagick
sudo apt install -y imagemagick

# Resize images on upload
convert input.jpg -resize 800x600 output.jpg
```

### CDN Configuration

**CloudFront / Cloudflare:**
- Compress images: ✅
- Browser cache: 30 days
- Gzip compression: ✅
- Minify CSS/JS: ✅

---

## Security Hardening

### API Security

#### Rate Limiting
```javascript
// backend/src/server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

#### CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

#### Helmet (Security Headers)
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### Database Security

```sql
-- Create database user with minimal privileges
CREATE USER 'appuser'@'%' IDENTIFIED BY 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON farmersDB.* TO 'appuser'@'%';
FLUSH PRIVILEGES;

-- Disable root login
ALTER USER 'root'@'localhost' IDENTIFIED BY 'very-strong-password';
```

### Server Security

```bash
# SSH Security
# Change default port
sudo nano /etc/ssh/sshd_config
# Port 2222 (change from 22)
# PermitRootLogin no
# PasswordAuthentication no

# Firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## Troubleshooting

### Backend Issues

#### App won't start
```bash
# Check logs
pm2 logs farmers-api

# Check port is free
lsof -i :5000

# Restart
pm2 restart farmers-api
```

#### Database connection error
```bash
# Test connection
mysql -h host -u user -p -e "SELECT 1;"

# Check DATABASE_URL format
# mysql://user:password@host:port/dbname
```

#### File upload fails
```bash
# Check permission
ls -la /var/uploads
chmod 755 /var/uploads

# Check disk space
df -h
```

### Frontend Issues

#### Build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Check Node version (should be 14+)
node --version
```

#### Slow loading
```bash
# Analyze bundle
npm run build -- --analyze

# Optimize images
# Reduce initial JavaScript
# Enable gzip compression in Nginx
```

### Deployment Issues

#### SSL certificate issues
```bash
# Check certificate
openssl s_client -connect your-domain.com:443

# Renew certificate
sudo certbot renew --force-renewal
```

#### Environment variables not loaded
```bash
# Verify in Heroku
heroku config

# Verify in EC2
cat ~/.env

# Restart app
pm2 restart farmers-api
```

---

## Rollback Procedure

### If Deployment Goes Wrong

#### Heroku Rollback
```bash
# Check releases
heroku releases

# Rollback to previous
heroku rollback v123
```

#### EC2/DigitalOcean Rollback
```bash
# Stop current version
pm2 stop farmers-api

# Switch to previous code
cd /home/appuser/farmers-marketplace
git checkout previous-version
npm install
pm2 start ecosystem.config.js
```

---

## Final Checklist

- [ ] SSL/HTTPS enabled
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Error logging enabled
- [ ] CORS properly secured
- [ ] Environment variables set correctly
- [ ] Load testing completed
- [ ] Rollback procedure tested
- [ ] Documentation updated
- [ ] Team trained on deployment

---

End of Deployment Guide

For questions or issues, refer to:
- Setup Guide: SETUP_GUIDE.md
- API Documentation: API_DOCUMENTATION.md
- Database Schema: DATABASE_SCHEMA.md
- Testing Guide: TESTING_GUIDE.md
