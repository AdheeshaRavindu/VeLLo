# Cloudflare Configuration for VeLLo
# This file documents Cloudflare setup for optimal performance and security

## DNS Records Configuration

### Required Records
```
Record Type | Name                      | Value                          | Proxy
------------|---------------------------|--------------------------------|-------
A           | api                       | your-backend.railway.app       | Proxied
CNAME       | www                       | yourdomain.com                 | Proxied
A           | @                         | your-frontend.railway.app     | Proxied
```

## SSL/TLS Configuration

- **Mode**: Full (strict)
- **Minimum TLS Version**: TLS 1.3
- **Auto HTTPS Rewrites**: Enabled
- **Certificate Transparency Monitoring**: Enabled

## Cache Configuration

### Cache Rules
1. **Bypass cache for API endpoints**
   - If: `http.request.uri.path starts with "/api"`
   - Cache Level: Bypass
   - Browser Cache TTL: Respect existing headers

2. **Cache static assets aggressively**
   - If: `http.request.uri.path matches ".*\.(js|css|png|jpg|jpeg|gif|svg|webp)$"`
   - Cache Level: Cache Everything
   - Browser Cache TTL: 1 month (2592000)
   - Edge Cache TTL: 1 month

3. **Cache HTML pages**
   - If: `http.request.uri.path matches ".*\.html$"`
   - Cache Level: Cache Everything
   - Browser Cache TTL: 1 hour (3600)
   - Edge Cache TTL: 30 minutes

## Page Rules (Legacy, use Cache Rules instead)

1. **API Endpoints**
   - URL: yourdomain.com/api/*
   - Cache Level: Bypass
   - Browser Cache TTL: Respect existing headers

2. **Static Assets**
   - URL: yourdomain.com/static/*
   - Cache Level: Cache Everything
   - Browser Cache TTL: 1 month

3. **Dynamic Content**
   - URL: yourdomain.com/*
   - Cache Level: Standard
   - Browser Cache TTL: 30 minutes

## WAF (Web Application Firewall) Rules

### Enable OWASP Core Rule Set
- Level: Sensitive (catches most attacks)
- Action: Block

### Custom Rules
1. **Rate Limiting on API**
   ```
   If: (http.request.uri.path starts with "/api")
   Then: Rate limit to 100 requests per 10 seconds
   ```

2. **Block bad bots**
   ```
   If: (cf.bot_management.score < 50)
   Then: Block
   ```

## Performance Settings

- **Brotli Compression**: Enabled
- **Minify CSS/JS/HTML**: Enabled
- **Early Hints**: Enabled
- **Polish**: Lossless (or Lossy for aggressive compression)
- **Rocket Loader**: Disabled (can cause issues with modern frameworks)

## Reliability Settings

- **Auto Minify**: CSS, JavaScript, HTML
- **Always Use HTTPS**: Enabled
- **Automatic HTTPS Rewrites**: Enabled

## Email Routing

If using catch-all email forwarding:
- Enable Email Routing
- Forward to your email address
- Verify email address

## Analytics & Monitoring

### Cloudflare Analytics
- **Real User Monitoring**: Track page load times and performance metrics
- **Page Rules Analytics**: Monitor cache hit ratio
- **Workers Analytics**: If using Cloudflare Workers

### Recommended Metrics to Monitor
- Cache hit ratio (aim for >80% for static assets)
- Average response time
- Error rate (HTTP 5xx)
- Requests blocked by WAF

## Argo Smart Routing (Premium)

If using premium plan:
- Enable Argo Smart Routing for faster routing
- Monitor latency improvements
- Expected: 30% faster for global traffic

## Logpush Configuration

Send logs to external service:
1. Enable Logpush
2. Choose destination (S3, BigQuery, Datadog, etc.)
3. Select datasets:
   - HTTP Requests
   - Firewall Events
   - Cache Analytics

## Worker Scripts (Optional)

### Example: Redirect API Requests
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Redirect API requests
    if (url.pathname.startsWith('/api')) {
      return fetch(new Request('https://api.yourdomain.com' + url.pathname, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }));
    }
    
    // Normal requests
    return fetch(request);
  },
};
```

## Testing & Validation

### DNS Propagation
```bash
# Check DNS records
dig api.yourdomain.com
nslookup yourdomain.com

# Verify SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Cache Testing
```bash
# Check cache headers
curl -I https://yourdomain.com/api/health
# Look for: cf-cache-status header (HIT/MISS/BYPASS)

# Test compression
curl -I -H "Accept-Encoding: gzip" https://yourdomain.com/static/file.js
# Look for: content-encoding: gzip
```

### Performance Testing
```bash
# Use Cloudflare Speed Test
https://www.cloudflare.com/speed/

# Use WebPageTest
https://www.webpagetest.org/
```

## Cost Optimization

- **Free Plan**: Sufficient for most use cases
- **Pro Plan**: $20/month - Better DDoS protection, WAF rules
- **Business Plan**: $200/month - Advanced Security, Page Rules
- **Enterprise**: Custom pricing - Advanced features

For VeLLo, Free or Pro plan should be sufficient initially.

## Troubleshooting

### Issue: API requests are slow
- Check if Cache Rules are bypassing API correctly
- Verify Backend is on Railway with good uptime
- Check Railway metrics for performance

### Issue: Mixed Content Warning
- Ensure SSL/TLS is set to "Full (strict)"
- Check backend is using HTTPS
- Disable "Rocket Loader" in Speed settings

### Issue: Images not loading
- Check if image compression is enabled in Polish
- Verify image paths are correct
- Check if CSS/JS minification broke anything

### Issue: High error rate
- Check WAF rules aren't too strict
- Monitor Railway backend logs
- Check if database connections are stable

## Security Best Practices

1. **Enable 2FA** on Cloudflare account
2. **Use API Tokens** instead of Global API Key
3. **Monitor** WAF logs for attacks
4. **Regularly review** security settings
5. **Enable** DNSSEC if supported
6. **Rate limit** sensitive endpoints
7. **Use** strong passwords for Railway/GitHub

## Links & Resources

- Cloudflare Docs: https://developers.cloudflare.com/
- Railway Docs: https://docs.railway.app/
- Next.js Deployment: https://nextjs.org/docs/deployment
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/

