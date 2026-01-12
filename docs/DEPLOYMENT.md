# Deployment Guide

This guide covers deploying SegmentIQ to various environments.

---

## Table of Contents

- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Production Checklist](#production-checklist)

---

## Docker Deployment

### Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/customer-segmentation.git
cd customer-segmentation

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Services

| Service | Port | Description |
|---------|------|-------------|
| `db` | 5432 | PostgreSQL database |
| `api` | 8000 | FastAPI backend |
| `frontend` | 3000 | React frontend |

### docker-compose.yml

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: segmentation-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: customerseg
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build: ./backend
    container_name: segmentation-api
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/customerseg
      ENV: production
    ports:
      - "8000:8000"
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend/data:/app/data
      - ./backend/outputs:/app/outputs

  frontend:
    build: ./frontend
    container_name: segmentation-frontend
    ports:
      - "3000:80"
    depends_on:
      - api

volumes:
  postgres_data:
```

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build api
```

### Managing Containers

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart a service
docker-compose restart api

# View logs
docker-compose logs -f api
```

### Database Migrations

```bash
# Run migrations in container
docker-compose exec api alembic upgrade head

# Create new migration
docker-compose exec api alembic revision --autogenerate -m "description"
```

---

## Manual Deployment

### Backend Deployment

#### 1. Server Setup

```bash
# Install Python 3.11+
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib
```

#### 2. Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE customerseg;
CREATE USER segmentation_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE customerseg TO segmentation_user;
\q
```

#### 3. Application Setup

```bash
# Clone repository
git clone https://github.com/your-username/customer-segmentation.git
cd customer-segmentation/backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
nano .env  # Edit with production values
```

#### 4. Run Migrations

```bash
alembic upgrade head
```

#### 5. Run with Gunicorn

```bash
pip install gunicorn

gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### 6. Systemd Service

Create `/etc/systemd/system/segmentation-api.service`:

```ini
[Unit]
Description=SegmentIQ API
After=network.target postgresql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/customer-segmentation/backend
Environment="PATH=/opt/customer-segmentation/backend/venv/bin"
EnvironmentFile=/opt/customer-segmentation/backend/.env
ExecStart=/opt/customer-segmentation/backend/venv/bin/gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable segmentation-api
sudo systemctl start segmentation-api
```

### Frontend Deployment

#### 1. Build Frontend

```bash
cd frontend
npm install
npm run build
```

#### 2. Nginx Configuration

Create `/etc/nginx/sites-available/segmentation`:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /opt/customer-segmentation/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Static files (dendrograms)
    location /outputs {
        alias /opt/customer-segmentation/backend/outputs;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/segmentation /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Cloud Deployment

### AWS EC2

1. Launch EC2 instance (t3.medium recommended)
2. Configure security groups (ports 80, 443, 22)
3. Install Docker and Docker Compose
4. Follow Docker deployment steps

### AWS ECS (Fargate)

1. Create ECR repositories for images
2. Push Docker images to ECR
3. Create ECS cluster with Fargate
4. Deploy services with task definitions

### DigitalOcean App Platform

1. Connect GitHub repository
2. Configure build settings
3. Add PostgreSQL managed database
4. Deploy

### Heroku

#### Backend

```bash
# Create Heroku app
heroku create segmentation-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git subtree push --prefix backend heroku main

# Run migrations
heroku run alembic upgrade head
```

#### Frontend (on Vercel/Netlify)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

---

## Production Checklist

### Security

- [ ] Use HTTPS with SSL certificates (Let's Encrypt)
- [ ] Set secure database passwords
- [ ] Configure CORS for specific origins
- [ ] Add rate limiting
- [ ] Enable request logging
- [ ] Set up firewall rules
- [ ] Use environment variables for secrets

### Performance

- [ ] Enable gzip compression in Nginx
- [ ] Configure caching headers for static files
- [ ] Use connection pooling for database
- [ ] Set appropriate worker counts

### Monitoring

- [ ] Set up application logging
- [ ] Configure error tracking (Sentry)
- [ ] Add health check endpoints
- [ ] Set up uptime monitoring
- [ ] Configure alerting

### Backup

- [ ] Schedule PostgreSQL backups
- [ ] Back up uploaded datasets
- [ ] Store backups offsite

### Environment Variables (Production)

```env
APP_NAME=SegmentIQ
ENV=production
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
UPLOAD_DIR=/data/uploads
OUTPUT_DIR=/data/outputs
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## Scaling

### Horizontal Scaling

- Run multiple API instances behind load balancer
- Use shared file storage (S3/GCS) for uploads and outputs
- Use Redis for session storage if needed

### Vertical Scaling

- Increase server resources for larger datasets
- Optimize PostgreSQL configuration
- Use faster storage (SSD)

### Database Scaling

- Enable read replicas for heavy read loads
- Consider connection pooling (PgBouncer)
- Archive old clustering runs

