# GitHub Deployment Guide

This guide will help you deploy BiddingQueen to GitHub and test it online.

## Step 1: Initialize Git Repository

```bash
cd /Users/asingh/Documents/repos/ami-proj/nodeJs/biddingQueen
git init
git add .
git commit -m "Initial commit: BiddingQueen auction platform"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `biddingqueen`
3. Description: "Real-time auction bidding platform with $5 increments"
4. Make it Public or Private
5. **Do NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 3: Push to GitHub

Replace `yourusername` with your GitHub username:

```bash
git remote add origin https://github.com/yourusername/biddingqueen.git
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Render (Free Hosting)

### Option A: Render (Recommended - Free Tier Available)

1. Go to https://render.com and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `biddingqueen` repository
5. Configure:
   - **Name**: biddingqueen (or your choice)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. Your app will be live at: `https://biddingqueen.onrender.com`

### Option B: Railway (Also Free Tier)

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `biddingqueen`
5. Railway auto-detects Node.js and deploys
6. Click on your service → "Settings" → Generate Domain
7. Your app will be live!

### Option C: Fly.io (Free Tier)

1. Install Fly CLI: https://fly.io/docs/hands-on/install-flyctl/
2. Login: `flyctl auth login`
3. Navigate to project: `cd biddingQueen`
4. Launch: `flyctl launch`
5. Follow prompts (choose region, etc.)
6. Deploy: `flyctl deploy`

## Step 5: Test Your Deployment

Once deployed, visit your URL and:

1. ✅ Check that auctions load
2. ✅ Try placing a bid
3. ✅ Open in multiple browser tabs to see real-time updates
4. ✅ Test on mobile device

## WebSocket Configuration for Production

If WebSocket isn't working in production, update `public/app.js`:

```javascript
// Replace this line:
const WS_URL = `ws://${window.location.hostname}:${window.location.port || 3000}`;

// With:
const WS_URL = window.location.protocol === 'https:' 
  ? `wss://${window.location.host}` 
  : `ws://${window.location.host}`;
```

Then commit and push:
```bash
git add .
git commit -m "Fix WebSocket for production"
git push
```

## Troubleshooting

### Server won't start
- Check that `PORT` environment variable is set in deployment platform
- Verify all dependencies are in `package.json`

### WebSocket not connecting
- Use `wss://` for HTTPS sites
- Check firewall/proxy settings
- Most platforms support WebSocket by default

### Images not loading
- Verify Unsplash URLs are accessible
- Consider hosting images on your own CDN

## Next Steps

1. **Custom Domain**: Add your own domain in hosting platform settings
2. **Database**: Add MongoDB or PostgreSQL for persistent data
3. **Authentication**: Implement user login system
4. **Email**: Set up email notifications for winning bids
5. **Payment**: Integrate Stripe for payment processing

## Local Development

```bash
# Install dependencies
npm install

# Start dev server with auto-reload
npm run dev

# Access at
http://localhost:3000
```

## Environment Variables

Set these in your hosting platform:

- `PORT`: Server port (auto-set by most platforms)
- Add more as you extend the app

---

Need help? Open an issue on GitHub!
