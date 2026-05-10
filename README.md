# BiddingQueen 👑

A modern, real-time online auction platform built with Node.js, Express, and WebSocket technology.

## 🌟 Features

✨ **Real-Time Bidding**: Live updates across all connected clients using WebSocket  
💵 **Simple Bid Increments**: All bids increment by $5, starting at $5  
📅 **Multiple Auctions**: 12+ auctions (Past, Live, Upcoming) with 25-30 items each  
🔥 **Hot Items Tracking**: See which items are getting the most bids  
🎨 **Beautiful UI**: Modern, responsive design with smooth animations  
🖼️ **Image Gallery**: 3-5 photos per item with thumbnail navigation  
🔔 **Live Notifications**: Get notified when new bids are placed  
📊 **Admin Dashboard**: Comprehensive analytics and performance metrics  
📱 **Mobile Responsive**: Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/biddingqueen.git
cd biddingqueen
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser:
```
http://localhost:3456
```

### Admin Dashboard

Access the admin analytics dashboard at:
```
http://localhost:3456/admin.html
```

## 📦 Project Structure

```
biddingQueen/
├── server.js              # Express server with WebSocket & API
├── package.json           # Dependencies and scripts
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── Procfile              # Heroku deployment
├── vercel.json           # Vercel deployment
└── public/               # Frontend files
    ├── index.html        # Main auction page
    ├── admin.html        # Admin dashboard
    ├── styles.css        # Main styling
    ├── admin.css         # Admin-specific styles
    ├── app.js            # Main frontend logic
    └── admin.js          # Admin dashboard logic
```

## 🎯 Key Features

### For Users
- **Live Auctions**: Browse and bid on active auctions in real-time
- **Upcoming Auctions**: Preview scheduled auctions
- **Past Auctions**: View completed auctions with final prices
- **Search**: Find items by name or description
- **Image Gallery**: View multiple photos of each item
- **Real-time Updates**: See bids update instantly across devices

### For Admins
- **Revenue Tracking**: Total revenue and average per item
- **Hottest Items**: Top 10 items by bid count
- **Highest Value Items**: Top 10 items by current bid
- **Auction Performance**: Metrics for each auction
- **Category Breakdown**: Performance by item category
- **Recent Activity**: Bid activity in last 24 hours and 7 days

## 🌐 Deployment

### Deploy to Render (Recommended - Free Tier)

1. Push your code to GitHub
2. Go to [Render](https://render.com) and sign up/login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: biddingqueen
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Click "Create Web Service"
7. Your app will be live at: `https://biddingqueen.onrender.com`

### Deploy to Railway

1. Push code to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `biddingqueen`
5. Railway auto-detects Node.js and deploys
6. Click on your service → "Settings" → Generate Domain

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
```

## 🔧 Configuration

### Change Port

Edit `server.js`:
```javascript
const PORT = process.env.PORT || 3456; // Change 3456 to your port
```

### Change Bid Increment

Edit `server.js`:
```javascript
const BID_INCREMENT = 5; // Change to your desired increment
```

## 📊 API Endpoints

### Public Endpoints

- `GET /api/auctions` - Get all auctions (optional: ?status=live|past|upcoming)
- `GET /api/auctions/:auctionId` - Get specific auction
- `GET /api/auctions/:auctionId/items/:itemId` - Get item details
- `POST /api/auctions/:auctionId/items/:itemId/bid` - Place a bid
- `GET /api/stats` - Get general statistics
- `GET /api/health` - Health check

### Admin Endpoints

- `GET /api/admin/analytics` - Comprehensive analytics data

## 🎨 Customization

### Colors

Edit `public/styles.css`:
```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #7c3aed;
  /* Add your colors */
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for any purpose.

## 🙏 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ using Node.js, Express, and WebSocket
