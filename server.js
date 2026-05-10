const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3456;
const BID_INCREMENT = 5;
const STARTING_BID = 5;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Item categories for generating realistic auction items
const itemCategories = {
  furniture: [
    { name: 'Vintage Oak Dining Table', desc: 'Beautiful antique oak dining table, seats 6-8 people', img: 'https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=400' },
    { name: 'Leather Recliner Chair', desc: 'Comfortable genuine leather recliner in excellent condition', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400' },
    { name: 'Bookshelf Cabinet', desc: '5-tier wooden bookshelf, sturdy construction', img: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400' },
    { name: 'Office Desk Chair', desc: 'Ergonomic office chair with lumbar support', img: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400' },
    { name: 'Modern Sofa Set', desc: '3-piece sectional sofa, fabric upholstery', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
    { name: 'Queen Size Bed Frame', desc: 'Solid wood bed frame with headboard', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400' },
    { name: 'Coffee Table', desc: 'Modern glass top coffee table with storage', img: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400' },
    { name: 'Dresser with Mirror', desc: '6-drawer dresser with large mirror', img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400' },
    { name: 'Bar Stool Set', desc: 'Set of 4 adjustable bar stools', img: 'https://images.unsplash.com/photo-1551218372-a8789b81b253?w=400' },
    { name: 'Entertainment Center', desc: 'Large TV stand with shelving', img: 'https://images.unsplash.com/photo-1565183997392-2f5d9f7e046a?w=400' }
  ],
  electronics: [
    { name: 'Smart TV 55 inch', desc: '4K Ultra HD Smart LED TV with HDR', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400' },
    { name: 'Laptop Computer', desc: 'High-performance laptop, 16GB RAM, SSD', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
    { name: 'Gaming Console', desc: 'Latest generation gaming console with controllers', img: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400' },
    { name: 'Bluetooth Speaker', desc: 'Portable wireless speaker with bass boost', img: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
    { name: 'Digital Camera', desc: 'DSLR camera with 18-55mm lens', img: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400' },
    { name: 'Tablet Device', desc: '10-inch tablet with stylus', img: 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=400' },
    { name: 'Wireless Headphones', desc: 'Noise-canceling over-ear headphones', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { name: 'Smart Watch', desc: 'Fitness tracking smartwatch with GPS', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
    { name: 'Home Theater System', desc: '5.1 surround sound system', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { name: 'Coffee Maker Machine', desc: 'Automatic espresso and coffee maker', img: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400' }
  ],
  tools: [
    { name: 'Professional Tool Set', desc: 'Complete professional-grade tool set with carrying case', img: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400' },
    { name: 'Electric Power Drill', desc: 'Cordless electric power drill with battery and charger', img: 'https://images.unsplash.com/photo-1572981779307-38b8cdb70d50?w=400' },
    { name: 'Circular Saw', desc: 'Heavy-duty circular saw with laser guide', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400' },
    { name: 'Air Compressor', desc: 'Portable air compressor with hose', img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400' },
    { name: 'Chainsaw', desc: 'Gas-powered chainsaw with safety gear', img: 'https://images.unsplash.com/photo-1569175078185-51c1b0c5f6c7?w=400' },
    { name: 'Welding Machine', desc: 'MIG welder with accessories', img: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400' },
    { name: 'Pressure Washer', desc: 'Electric pressure washer 2000 PSI', img: 'https://images.unsplash.com/photo-1581873372796-dc27a681fa4d?w=400' },
    { name: 'Ladder 12ft', desc: 'Aluminum extension ladder', img: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400' },
    { name: 'Workbench', desc: 'Heavy-duty workbench with storage', img: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96007f?w=400' },
    { name: 'Generator', desc: 'Portable gas generator 5000W', img: 'https://images.unsplash.com/photo-1581092583537-20d51876f918?w=400' }
  ],
  outdoor: [
    { name: 'Outdoor Grill Set', desc: 'Stainless steel gas grill with accessories', img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400' },
    { name: 'Patio Furniture Set', desc: '5-piece wicker patio set with cushions', img: 'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=400' },
    { name: 'Lawn Mower', desc: 'Self-propelled gas lawn mower', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { name: 'Bicycle', desc: 'Mountain bike 21-speed aluminum frame', img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400' },
    { name: 'Kayak', desc: 'Single person kayak with paddle', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400' },
    { name: 'Camping Tent', desc: '6-person camping tent with rain fly', img: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=400' },
    { name: 'Fire Pit', desc: 'Outdoor steel fire pit with screen', img: 'https://images.unsplash.com/photo-1605117882932-f9e32b03fea9?w=400' },
    { name: 'Garden Tool Set', desc: 'Complete gardening tool kit', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400' },
    { name: 'Hammock Stand', desc: 'Portable hammock with steel stand', img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400' },
    { name: 'Cooler 50 Quart', desc: 'Heavy-duty insulated cooler', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' }
  ],
  decor: [
    { name: 'Framed Wall Art Set', desc: 'Set of 3 framed abstract art pieces', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400' },
    { name: 'Vintage Wall Clock', desc: 'Decorative vintage wall clock, working condition', img: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=400' },
    { name: 'Area Rug 8x10', desc: 'Modern geometric pattern area rug', img: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=400' },
    { name: 'Table Lamp Pair', desc: 'Set of 2 decorative table lamps', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
    { name: 'Wall Mirror Large', desc: 'Decorative framed wall mirror', img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400' },
    { name: 'Throw Pillow Set', desc: 'Set of 6 decorative throw pillows', img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400' },
    { name: 'Vase Collection', desc: 'Set of decorative ceramic vases', img: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400' },
    { name: 'Curtain Panels', desc: 'Blackout curtain panels 84 inch', img: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400' },
    { name: 'Artificial Plant Set', desc: 'Set of realistic artificial plants', img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400' },
    { name: 'Photo Frame Set', desc: 'Gallery wall photo frame collection', img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400' }
  ]
};

// Helper function to generate additional images for an item
function generateItemImages(baseImage, itemName, count = 4) {
  const images = [baseImage];
  
  // Extract search term from item name for relevant images
  const searchTerm = itemName.toLowerCase().split(' ')[0]; // First word of item name
  
  // Generate variations using Unsplash's random photo API with the same search term
  // This ensures we get different but related images
  for (let i = 1; i < count; i++) {
    // Use different orientations and random seeds to get variety
    const orientations = ['landscape', 'portrait', 'squarish'];
    const orientation = orientations[i % orientations.length];
    const randomSeed = Math.floor(Math.random() * 1000);
    
    // Create URL with query parameters for variety
    let variantImage = baseImage;
    
    // Try different approaches for variety
    if (i === 1) {
      // Slightly different crop/zoom
      variantImage = baseImage.replace('?w=400', '?w=400&h=400&fit=crop&auto=format');
    } else if (i === 2) {
      // Different aspect ratio
      variantImage = baseImage.replace('?w=400', '?w=450&h=350&fit=crop&auto=format');
    } else if (i === 3) {
      // Brightness variation
      variantImage = baseImage.replace('?w=400', '?w=400&h=400&fit=crop&auto=format&q=80');
    } else {
      // Another crop style
      variantImage = baseImage.replace('?w=400', '?w=400&h=450&fit=crop&auto=format');
    }
    
    images.push(variantImage + '&sig=' + randomSeed);
  }
  
  return images;
}

// Helper function to generate items for an auction
function generateAuctionItems(auctionId, count, endTime, isPast) {
  const items = [];
  const allItems = Object.values(itemCategories).flat();
  let itemId = auctionId * 1000;
  
  for (let i = 0; i < count; i++) {
    const template = allItems[Math.floor(Math.random() * allItems.length)];
    const randomBidMultiplier = Math.floor(Math.random() * 20) + 1;
    const currentBid = isPast ? (STARTING_BID + (BID_INCREMENT * randomBidMultiplier)) : (STARTING_BID + (BID_INCREMENT * Math.floor(Math.random() * 10)));
    const imageCount = Math.floor(Math.random() * 3) + 3; // 3-5 images
    
    items.push({
      id: itemId++,
      name: template.name + (i > 9 ? ` #${i + 1}` : ''),
      description: template.desc,
      image: template.img,
      images: generateItemImages(template.img, template.name, imageCount),
      currentBid: currentBid,
      finalBid: isPast ? currentBid : null,
      startingBid: STARTING_BID,
      bidCount: isPast ? randomBidMultiplier : Math.floor(Math.random() * 15),
      endTime: endTime.toISOString(),
      status: isPast ? 'closed' : 'active'
    });
  }
  
  return items;
}

// Generate auction data
const now = new Date('2026-05-09T14:00:00');

let auctions = [
  // PAST AUCTIONS (3 auctions)
  {
    id: 1,
    title: 'BHAM SALE #380 - 04/21/2026',
    status: 'past',
    startTime: new Date('2026-04-21T09:00:00').toISOString(),
    endTime: new Date('2026-04-21T18:00:00').toISOString(),
    items: generateAuctionItems(1, 28, new Date('2026-04-21T18:00:00'), true)
  },
  {
    id: 2,
    title: 'BHAM SALE #382 - 04/25/2026',
    status: 'past',
    startTime: new Date('2026-04-25T09:00:00').toISOString(),
    endTime: new Date('2026-04-25T18:00:00').toISOString(),
    items: generateAuctionItems(2, 30, new Date('2026-04-25T18:00:00'), true)
  },
  {
    id: 3,
    title: 'BHAM SALE #384 - 04/28/2026',
    status: 'past',
    startTime: new Date('2026-04-28T09:00:00').toISOString(),
    endTime: new Date('2026-04-28T18:00:00').toISOString(),
    items: generateAuctionItems(3, 27, new Date('2026-04-28T18:00:00'), true)
  },
  {
    id: 4,
    title: 'BHAM SALE #385 - 05/02/2026',
    status: 'past',
    startTime: new Date('2026-05-02T09:00:00').toISOString(),
    endTime: new Date('2026-05-02T18:00:00').toISOString(),
    items: generateAuctionItems(4, 29, new Date('2026-05-02T18:00:00'), true)
  },
  // LIVE AUCTIONS (2 auctions happening now)
  {
    id: 5,
    title: 'BHAM SALE #386 - 05/09/2026',
    status: 'live',
    startTime: new Date('2026-05-09T09:00:00').toISOString(),
    endTime: new Date('2026-05-09T18:00:00').toISOString(),
    items: generateAuctionItems(5, 30, new Date('2026-05-09T18:00:00'), false)
  },
  {
    id: 6,
    title: 'BHAM SALE #387 - 05/09/2026',
    status: 'live',
    startTime: new Date('2026-05-09T10:00:00').toISOString(),
    endTime: new Date('2026-05-09T19:00:00').toISOString(),
    items: generateAuctionItems(6, 28, new Date('2026-05-09T19:00:00'), false)
  },
  // UPCOMING AUCTIONS (6 auctions)
  {
    id: 7,
    title: 'BHAM SALE #388 - 05/12/2026',
    status: 'upcoming',
    startTime: new Date('2026-05-12T09:00:00').toISOString(),
    endTime: new Date('2026-05-12T18:00:00').toISOString(),
    items: generateAuctionItems(7, 26, new Date('2026-05-12T18:00:00'), false)
  },
  {
    id: 8,
    title: 'BHAM SALE #389 - 05/15/2026',
    status: 'upcoming',
    startTime: new Date('2026-05-15T09:00:00').toISOString(),
    endTime: new Date('2026-05-15T18:00:00').toISOString(),
    items: generateAuctionItems(8, 29, new Date('2026-05-15T18:00:00'), false)
  },
  {
    id: 9,
    title: 'BHAM SALE #390 - 05/19/2026',
    status: 'upcoming',
    startTime: new Date('2026-05-19T09:00:00').toISOString(),
    endTime: new Date('2026-05-19T18:00:00').toISOString(),
    items: generateAuctionItems(9, 27, new Date('2026-05-19T18:00:00'), false)
  },
  {
    id: 10,
    title: 'BHAM SALE #391 - 05/22/2026',
    status: 'upcoming',
    startTime: new Date('2026-05-22T09:00:00').toISOString(),
    endTime: new Date('2026-05-22T18:00:00').toISOString(),
    items: generateAuctionItems(10, 30, new Date('2026-05-22T18:00:00'), false)
  },
  {
    id: 11,
    title: 'BHAM SALE #392 - 05/26/2026',
    status: 'upcoming',
    startTime: new Date('2026-05-26T09:00:00').toISOString(),
    endTime: new Date('2026-05-26T18:00:00').toISOString(),
    items: generateAuctionItems(11, 28, new Date('2026-05-26T18:00:00'), false)
  },
  {
    id: 12,
    title: 'BHAM SALE #393 - 05/29/2026',
    status: 'upcoming',
    startTime: new Date('2026-05-29T09:00:00').toISOString(),
    endTime: new Date('2026-05-29T18:00:00').toISOString(),
    items: generateAuctionItems(12, 25, new Date('2026-05-29T18:00:00'), false)
  }
];

// Broadcast to all connected WebSocket clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  
  ws.on('message', (message) => {
    console.log('Received:', message.toString());
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
  });
});

// Routes

// Get all auctions with optional status filter
app.get('/api/auctions', (req, res) => {
  const { status } = req.query;
  
  let filteredAuctions = auctions;
  if (status) {
    filteredAuctions = auctions.filter(a => a.status === status);
  }
  
  res.json(filteredAuctions);
});

// Get auction statistics
app.get('/api/stats', (req, res) => {
  const stats = {
    totalAuctions: auctions.length,
    pastAuctions: auctions.filter(a => a.status === 'past').length,
    liveAuctions: auctions.filter(a => a.status === 'live').length,
    upcomingAuctions: auctions.filter(a => a.status === 'upcoming').length,
    totalItems: auctions.reduce((sum, a) => sum + a.items.length, 0),
    activeItems: auctions
      .filter(a => a.status === 'live')
      .reduce((sum, a) => sum + a.items.length, 0)
  };
  res.json(stats);
});

// Get admin analytics
app.get('/api/admin/analytics', (req, res) => {
  // Collect all items from all auctions
  const allItems = auctions.flatMap(a => 
    a.items.map(item => ({
      ...item,
      auctionId: a.id,
      auctionTitle: a.title,
      auctionStatus: a.status
    }))
  );
  
  // Sort by bid count to find hottest items
  const hottestItems = [...allItems]
    .sort((a, b) => b.bidCount - a.bidCount)
    .slice(0, 10);
  
  // Sort by current bid to find highest value items
  const highestValueItems = [...allItems]
    .sort((a, b) => b.currentBid - a.currentBid)
    .slice(0, 10);
  
  // Get sold items (past auctions)
  const soldItems = allItems.filter(item => item.status === 'closed');
  
  // Calculate total revenue
  const totalRevenue = soldItems.reduce((sum, item) => sum + (item.finalBid || item.currentBid), 0);
  
  // Calculate average bid per item
  const avgBidPerItem = soldItems.length > 0 
    ? totalRevenue / soldItems.length 
    : 0;
  
  // Calculate total bids
  const totalBids = allItems.reduce((sum, item) => sum + item.bidCount, 0);
  
  // Get category breakdown
  const categoryStats = {};
  allItems.forEach(item => {
    const category = item.name.split(' ')[0]; // First word as category approximation
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, totalBids: 0, totalRevenue: 0 };
    }
    categoryStats[category].count++;
    categoryStats[category].totalBids += item.bidCount;
    if (item.status === 'closed') {
      categoryStats[category].totalRevenue += (item.finalBid || item.currentBid);
    }
  });
  
  // Get auction performance
  const auctionPerformance = auctions.map(auction => {
    const items = auction.items;
    const totalBids = items.reduce((sum, item) => sum + item.bidCount, 0);
    const avgBidsPerItem = items.length > 0 ? totalBids / items.length : 0;
    const revenue = auction.status === 'past' 
      ? items.reduce((sum, item) => sum + (item.finalBid || item.currentBid), 0)
      : 0;
    
    return {
      id: auction.id,
      title: auction.title,
      status: auction.status,
      itemCount: items.length,
      totalBids,
      avgBidsPerItem: Math.round(avgBidsPerItem * 10) / 10,
      revenue,
      startTime: auction.startTime,
      endTime: auction.endTime
    };
  }).sort((a, b) => b.totalBids - a.totalBids);
  
  // Bidding trends (items with increasing activity)
  const trendingItems = allItems
    .filter(item => item.status === 'active')
    .sort((a, b) => b.bidCount - a.bidCount)
    .slice(0, 10);
  
  res.json({
    overview: {
      totalAuctions: auctions.length,
      totalItems: allItems.length,
      soldItems: soldItems.length,
      activeItems: allItems.filter(i => i.status === 'active').length,
      totalRevenue: Math.round(totalRevenue),
      avgBidPerItem: Math.round(avgBidPerItem * 100) / 100,
      totalBids,
      avgBidsPerAuction: Math.round((totalBids / auctions.length) * 10) / 10
    },
    hottestItems,
    highestValueItems,
    trendingItems,
    categoryStats,
    auctionPerformance,
    recentActivity: {
      last24Hours: Math.floor(totalBids * 0.15), // Simulated
      last7Days: Math.floor(totalBids * 0.45)
    }
  });
});

// Get specific auction
app.get('/api/auctions/:auctionId', (req, res) => {
  const auctionId = parseInt(req.params.auctionId);
  const auction = auctions.find(a => a.id === auctionId);
  
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found' });
  }
  
  res.json(auction);
});

// Get specific item from auction
app.get('/api/auctions/:auctionId/items/:itemId', (req, res) => {
  const auctionId = parseInt(req.params.auctionId);
  const itemId = parseInt(req.params.itemId);
  
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found' });
  }
  
  const item = auction.items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  res.json(item);
});

// Place a bid
app.post('/api/auctions/:auctionId/items/:itemId/bid', (req, res) => {
  const auctionId = parseInt(req.params.auctionId);
  const itemId = parseInt(req.params.itemId);
  const { bidderName } = req.body;
  
  const auction = auctions.find(a => a.id === auctionId);
  if (!auction) {
    return res.status(404).json({ error: 'Auction not found' });
  }
  
  const item = auction.items.find(i => i.id === itemId);
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  // Check if auction has ended
  if (new Date(item.endTime) < new Date()) {
    return res.status(400).json({ error: 'Auction has ended' });
  }
  
  // Calculate next bid
  const nextBid = item.currentBid + BID_INCREMENT;
  item.currentBid = nextBid;
  item.bidCount++;
  
  // Broadcast update to all clients
  broadcast({
    type: 'BID_UPDATE',
    auctionId,
    itemId,
    currentBid: item.currentBid,
    bidCount: item.bidCount,
    bidderName: bidderName || 'Anonymous'
  });
  
  res.json({
    success: true,
    item,
    message: `Bid placed successfully! New bid: $${item.currentBid}`
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`🚀 BiddingQueen server running on http://localhost:${PORT}`);
  console.log(`📊 WebSocket server ready for real-time updates`);
});
