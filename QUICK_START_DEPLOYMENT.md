# Quick Start: Deploy VeLLo to Railway + Cloudflare

## ⚡ Quick Deployment (5 minutes)

### Prerequisites
- GitHub account (already have VeLLo repo)
- Railway account (free): https://railway.app
- Cloudflare account (free): https://cloudflare.com

---

## Step 1: Prepare Your Code

```bash
cd c:\Users\HP\Downloads\VeLLo

# Update frontend environment
# Edit frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app

# Update backend environment
# Edit backend/.env
OPENAI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
```

---

## Step 2: Deploy Backend to Railway

### Option A: Using Railway Dashboard (Easiest)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `VeLLo` repository
5. Railway auto-detects Docker setup
6. Add Environment Variables:
   - Go to Service Settings
   - Add all variables from `backend/.env`
7. Click Deploy
8. Wait for build to complete
9. Copy the public URL (e.g., `https://vello-backend-production.up.railway.app`)

### Option B: Using Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create new project
railway init

# Deploy backend
cd backend
railway service new
railway up --detach

# Get URL
railway run echo $RAILWAY_PUBLIC_URL
```

---

## Step 3: Deploy Frontend to Railway

1. In Railway Dashboard, add new service
2. Connect to same GitHub repo
3. Set root directory: `frontend`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://vello-backend-production.up.railway.app
   NODE_ENV=production
   ```
5. Click Deploy
6. Wait for build (takes ~5 minutes)
7. Copy frontend URL

---

## Step 4: Configure Cloudflare (Optional but Recommended)

### Setup Domain

1. Go to https://dash.cloudflare.com
2. Add Site → enter your domain
3. Update nameservers at your domain registrar
4. Wait for propagation (up to 48 hours)

### Add DNS Records

Once domain is on Cloudflare:

```
Type  | Name | Value                                   | Proxy
------|------|-----------------------------------------|-------
CNAME | api  | vello-backend-production.up.railway.app| Proxied
CNAME | www  | vello-frontend-production.up.railway.app| Proxied
A     | @    | [Get from Cloudflare]                   | Proxied
```

### SSL/TLS

1. Go to SSL/TLS settings
2. Set to "Full (strict)"
3. Done! SSL is automatic

---

## Step 5: Test Your Deployment

### Test Backend
```bash
# If using Cloudflare
curl https://api.yourdomain.com/health

# If using Railway URL directly
curl https://vello-backend-production.up.railway.app/health
```

### Test Frontend
```bash
# If using Cloudflare
https://yourdomain.com

# If using Railway URL directly
https://vello-frontend-production.up.railway.app
```

---

## Environment Variable Reference

### Backend (`backend/.env`)
```env
PORT=8000
PYTHONUNBUFFERED=1
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=...
ENVIRONMENT=production
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NODE_ENV=production
```

---

## Common Issues & Solutions

### Issue: Frontend can't reach backend
**Solution:**
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check CORS is enabled in FastAPI
- Ensure backend service is running
- Check Railway logs for errors

### Issue: Railway build fails
**Solution:**
- Check Railway logs (Dashboard → Service → Logs)
- Verify `requirements.txt` is up to date
- Check for syntax errors in code
- Ensure Dockerfile exists

### Issue: High latency
**Solution:**
- Enable Cloudflare caching for static assets
- Upgrade Railway plan if hitting resource limits
- Check Railway metrics (CPU, Memory, Network)
- Use Railway in same region as your users

### Issue: 502 Bad Gateway
**Solution:**
- Wait 1-2 minutes for Railway deployment to stabilize
- Check if backend service crashed (Railway Logs)
- Verify environment variables are set
- Check if port is correct (should be 8000 for backend)

---

## Costs

| Service | Free Tier | Notes |
|---------|-----------|-------|
| Railway | $5 monthly credits | Usually enough for dev/small projects |
| Cloudflare | Free | With paid plans for DDoS protection |
| GitHub | Free | Public/private repos |
| **Total** | **~$0-5/month** | Very cost-effective |

---

## Next Steps After Deployment

1. **Set up monitoring**
   - Enable Railway alerts
   - Enable Cloudflare analytics
   - Add error tracking (Sentry, LogRocket)

2. **Set up CI/CD**
   - GitHub Actions auto-deploys on push
   - See `.github/workflows/deploy.yml`

3. **Add database** (if needed)
   - Railway has PostgreSQL plugin
   - Add to your project in Railway dashboard

4. **Enable backups**
   - Railway auto-backups databases
   - Export backups regularly

5. **Scale**
   - Upgrade Railway plan as traffic grows
   - Add more replicas for high availability
   - Use Cloudflare Workers for edge functions

---

## Useful Links

- **Railway Docs**: https://docs.railway.app/
- **Cloudflare Docs**: https://developers.cloudflare.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment/railroad
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **GitHub Actions**: https://docs.github.com/en/actions

---

## Support

- **Railway Support**: https://railway.app/support
- **Cloudflare Support**: https://support.cloudflare.com/
- **GitHub Issues**: See your repo Issues tab

---

**Last Updated**: May 17, 2026
**Status**: ✅ Ready for Deployment

