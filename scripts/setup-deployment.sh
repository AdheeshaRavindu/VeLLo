#!/bin/bash

# VeLLo Deployment Setup Script
# This script helps configure Railway and Cloudflare deployment

set -e

echo "================================"
echo "VeLLo Railway + Cloudflare Setup"
echo "================================"
echo ""

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    
    if ! command -v git &> /dev/null; then
        echo "❌ Git not found. Please install Git."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker not found. Please install Docker."
        exit 1
    fi
    
    echo "✅ Git and Docker found"
}

# Setup environment variables
setup_env_files() {
    echo ""
    echo "Setting up environment files..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        echo "Creating backend/.env..."
        cat > backend/.env << 'EOF'
# Backend Configuration
PORT=8000
PYTHONUNBUFFERED=1

# Add your API keys here
OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here

# Database (optional)
# DATABASE_URL=postgresql://user:pass@localhost/vello

# Environment
ENVIRONMENT=production
EOF
        echo "✅ Created backend/.env (please update with your keys)"
    fi
    
    # Frontend .env.local
    if [ ! -f frontend/.env.local ]; then
        echo "Creating frontend/.env.local..."
        cat > frontend/.env.local << 'EOF'
# Frontend Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NODE_ENV=development
EOF
        echo "✅ Created frontend/.env.local"
    fi
}

# Test Docker builds
test_docker_builds() {
    echo ""
    echo "Testing Docker builds..."
    
    echo "Building backend..."
    docker build -f backend/Dockerfile.prod -t vello-backend:latest backend/ || {
        echo "❌ Backend build failed"
        exit 1
    }
    echo "✅ Backend build successful"
    
    echo "Building frontend..."
    docker build -f frontend/Dockerfile.prod -t vello-frontend:latest frontend/ || {
        echo "❌ Frontend build failed"
        exit 1
    }
    echo "✅ Frontend build successful"
}

# Railway CLI setup instructions
railway_setup() {
    echo ""
    echo "========== Railway Setup Instructions =========="
    echo ""
    echo "1. Install Railway CLI:"
    echo "   npm i -g @railway/cli"
    echo ""
    echo "2. Login to Railway:"
    echo "   railway login"
    echo ""
    echo "3. Create a new Railway project:"
    echo "   railway init"
    echo ""
    echo "4. Add services:"
    echo "   railway service new"
    echo ""
    echo "5. Link your repository:"
    echo "   railway link"
    echo ""
    echo "6. Deploy:"
    echo "   railway up"
    echo ""
    echo "For more info: https://docs.railway.app/"
    echo ""
}

# Cloudflare setup instructions
cloudflare_setup() {
    echo ""
    echo "========== Cloudflare Setup Instructions =========="
    echo ""
    echo "1. Go to https://dash.cloudflare.com"
    echo "2. Add a Site (your domain)"
    echo "3. Update your domain nameservers to Cloudflare"
    echo "4. Create DNS records:"
    echo "   - A record: api.yourdomain.com → your-backend-railway-url"
    echo "   - CNAME: www → yourdomain.com (if using Pages)"
    echo ""
    echo "5. SSL/TLS Settings:"
    echo "   - Set to 'Full (strict)'"
    echo ""
    echo "6. Create Page Rules:"
    echo "   - /api/* → Cache Level: Bypass"
    echo "   - *.js → Cache Level: Cache Everything, TTL: 1 month"
    echo ""
    echo "For more info: https://developers.cloudflare.com/"
    echo ""
}

# GitHub workflow setup
github_actions_setup() {
    echo ""
    echo "========== GitHub Actions Setup =========="
    echo ""
    echo "1. Add Railway token to GitHub Secrets:"
    echo "   - Go to Settings > Secrets and variables > Actions"
    echo "   - Add: RAILWAY_TOKEN (from railway dashboard)"
    echo ""
    echo "2. The .github/workflows/deploy.yml will auto-deploy on push"
    echo ""
}

# Main execution
main() {
    check_prerequisites
    setup_env_files
    test_docker_builds
    railway_setup
    cloudflare_setup
    github_actions_setup
    
    echo ""
    echo "================================"
    echo "✅ Setup Complete!"
    echo "================================"
    echo ""
    echo "Next steps:"
    echo "1. Update backend/.env with your API keys"
    echo "2. Install Railway CLI and login"
    echo "3. Create Railway project"
    echo "4. Deploy services"
    echo "5. Configure Cloudflare DNS"
    echo "6. Test your deployment"
    echo ""
}

main "$@"
