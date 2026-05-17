# VeLLo Deployment Guide: Railway + Cloudflare

This guide explains how to deploy VeLLo to Railway with Cloudflare integration.

## Architecture Overview

```
┌─────────────────┐
│   Cloudflare    │ (DNS, CDN, Security)
└────────┬────────┘
         │
    ┌────┴─────┐
    │  Railway   │
├─Backend (FastAPI)
└─Frontend (Next.js)
```

## Option 1: Deploy Both Services to Railway (Recommended for Production)

### Prerequisites
- Railway account: https://railway.app
- GitHub account with VeLLo repository
- Cloudflare account (optional but recommended): https://cloudflare.com

### Step 1: Connect GitHub to Railway

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your VeLLo repository
6. Railway will auto-detect the Docker setup

### Step 2: Create Backend Service

1. In Railway dashboard, add a new service
2. Connect to your repo
3. Configure environment variables:
   ```
   PYTHONUNBUFFERED=1
   PORT=8000
   ```
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Railway will automatically:
   - Build using Dockerfile
   - Expose on port 8000
   - Provide a public URL

### Step 3: Create Frontend Service

1. Add another new service in Railway
2. Connect same repo
3. Set working directory: `frontend`
4. Configure environment variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
   NODE_ENV=production
   ```
5. Create `railway.json` in frontend folder (see templates below)
6. Next.js will build and serve on port 3000

### Step 4: Add Database (Optional)

If you need persistent storage:
1. Add PostgreSQL/MongoDB plugin in Railway
2. Railway auto-generates connection strings
3. Update backend `.env` with DB credentials

---

## Option 2: Deploy Frontend to Cloudflare Pages + Backend to Railway

### Frontend: Cloudflare Pages

1. **Build Next.js for Cloudflare:**
   ```bash
   npm run build  # Creates .next/standalone
   ```

2. **In Cloudflare Dashboard:**
   - Pages > Connect to Git
   - Select VeLLo repository
   - Build settings:
     - Framework: Next.js
     - Build command: `npm run build`
     - Build output directory: `.next`
   - Environment variables:
     ```
     NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app
     NODE_ENV=production
     ```

3. **Deploy:** Cloudflare Pages auto-deploys on push to main

### Backend: Railway (same as Option 1, Step 2)

---

## Configuration Files

### `railway.json` (Frontend)
Create this in the `frontend` folder:

```json
{
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "on_failure",
    "restartPolicyMaxRetries": 5
  }
}
```

### Production Dockerfile for Frontend
Replace `frontend/Dockerfile` with:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --omit=dev
EXPOSE 3000
CMD ["npm", "start"]
```

### Production Backend Dockerfile
Update `backend/Dockerfile` with:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends libgl1 libglib2.0-0 libgles2 libegl1 && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "$PORT"]
```

---

## Cloudflare Configuration

### DNS Setup
1. **Update Domain Registrar:** Point nameservers to Cloudflare
2. **In Cloudflare Dashboard:**
   - Go to DNS Settings
   - Add A record for backend API
   - Add CNAME for frontend (if using Pages)

### SSL/TLS
- Cloudflare provides free SSL
- Set to "Full (strict)" for encryption

### Proxy Settings
1. **For Railway Backend:**
   - Create DNS record: `api.yourdomain.com` → `your-backend.railway.app`
   - Enable proxy (orange cloud)
   - Set rules to bypass cache for API routes

2. **Cache Rules (recommended):**
   - Bypass cache for `/api/*`
   - Cache other static assets
   - Set TTL to 1 hour

### Example Cloudflare Rules
```
Rule 1:
Condition: Path starts with "/api"
Action: Cache Level = Bypass

Rule 2:
Condition: Path matches "/*.{js,css,png,jpg}"
Action: Cache Level = Cache Everything
TTL: 1 month
```

---

## Environment Variables

### Backend (.env)
```
PORT=8000
PYTHONUNBUFFERED=1
OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
```

### Frontend (.env.local for dev, or set in Railway/Cloudflare)
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NODE_ENV=production
```

---

## Monitoring & Logging

### Railway Logs
- View in Railway Dashboard under each service
- Filter by date/severity
- Export logs for analysis

### Cloudflare Analytics
- Real User Monitoring (RUM)
- Traffic analysis
- Error tracking

---

## CI/CD Pipeline

Railway auto-deploys on git push. To add more control:

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm i -g @railway/cli
          railway up --detach
```

---

## Troubleshooting

### Frontend can't reach Backend
- Check `NEXT_PUBLIC_API_BASE_URL` environment variable
- Verify CORS headers in FastAPI
- Check Cloudflare rules aren't blocking requests

### Build fails on Railway
- Check logs in Railway dashboard
- Verify Dockerfile paths
- Ensure all dependencies in requirements.txt

### High latency
- Enable Cloudflare cache for static assets
- Use Argo Smart Routing (premium)
- Check Railway metrics for resource usage

---

## Cost Estimation

- **Railway:** $5-50/month (depending on usage)
- **Cloudflare:** Free-$200/month (depending on plan)
- **Total:** ~$5-250/month

Use Railway free tier for development, upgrade for production.

---

## Next Steps

1. Create Railway account and connect GitHub
2. Set up backend service with correct environment variables
3. Set up frontend service pointing to backend
4. Test deployment
5. Configure Cloudflare DNS
6. Set up monitoring and auto-deployments
7. Run smoke tests on production

