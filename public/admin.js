// Configuration
const API_URL = window.location.origin;

// Fetch and display analytics data
async function fetchAnalytics() {
    try {
        const response = await fetch(`${API_URL}/api/admin/analytics`);
        const data = await response.json();
        
        displayOverview(data.overview);
        displayHottestItems(data.hottestItems);
        displayHighestValueItems(data.highestValueItems);
        displayAuctionPerformance(data.auctionPerformance);
        displayCategoryBreakdown(data.categoryStats);
        displayRecentActivity(data.recentActivity);
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
}

// Display overview stats
function displayOverview(overview) {
    document.getElementById('totalRevenue').textContent = `$${overview.totalRevenue.toLocaleString()}`;
    document.getElementById('totalBids').textContent = overview.totalBids.toLocaleString();
    document.getElementById('soldItems').textContent = overview.soldItems.toLocaleString();
    document.getElementById('avgBidPerItem').textContent = `$${overview.avgBidPerItem.toFixed(2)}`;
    document.getElementById('activeItems').textContent = overview.activeItems.toLocaleString();
    document.getElementById('avgBidsPerAuction').textContent = overview.avgBidsPerAuction.toFixed(1);
}

// Display hottest items
function displayHottestItems(items) {
    const tbody = document.getElementById('hottestItemsTable');
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map((item, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'regular';
        const statusClass = item.auctionStatus === 'live' ? 'live' : item.auctionStatus === 'past' ? 'past' : 'upcoming';
        
        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
                <td>
                    <div class="item-name">${item.name}</div>
                </td>
                <td>
                    <div class="auction-name">${item.auctionTitle}</div>
                </td>
                <td><span class="bid-count">${item.bidCount}</span></td>
                <td><span class="price-value">$${item.currentBid}</span></td>
                <td><span class="status-badge ${statusClass}">${item.auctionStatus}</span></td>
            </tr>
        `;
    }).join('');
}

// Display highest value items
function displayHighestValueItems(items) {
    const tbody = document.getElementById('highestValueItemsTable');
    
    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No items found</td></tr>';
        return;
    }
    
    tbody.innerHTML = items.map((item, index) => {
        const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'regular';
        const statusClass = item.auctionStatus === 'live' ? 'live' : item.auctionStatus === 'past' ? 'past' : 'upcoming';
        
        return `
            <tr>
                <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
                <td>
                    <div class="item-name">${item.name}</div>
                </td>
                <td>
                    <div class="auction-name">${item.auctionTitle}</div>
                </td>
                <td><span class="bid-count">${item.bidCount}</span></td>
                <td><span class="price-value">$${item.currentBid}</span></td>
                <td><span class="status-badge ${statusClass}">${item.auctionStatus}</span></td>
            </tr>
        `;
    }).join('');
}

// Display auction performance
function displayAuctionPerformance(auctions) {
    const tbody = document.getElementById('auctionPerformanceTable');
    
    if (auctions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No auctions found</td></tr>';
        return;
    }
    
    tbody.innerHTML = auctions.map(auction => {
        const statusClass = auction.status === 'live' ? 'live' : auction.status === 'past' ? 'past' : 'upcoming';
        const revenueDisplay = auction.revenue > 0 ? `$${auction.revenue.toLocaleString()}` : '-';
        
        return `
            <tr>
                <td><strong>${auction.title}</strong></td>
                <td><span class="status-badge ${statusClass}">${auction.status}</span></td>
                <td>${auction.itemCount}</td>
                <td><span class="bid-count">${auction.totalBids}</span></td>
                <td>${auction.avgBidsPerItem.toFixed(1)}</td>
                <td><span class="price-value">${revenueDisplay}</span></td>
            </tr>
        `;
    }).join('');
}

// Display category breakdown
function displayCategoryBreakdown(categoryStats) {
    const container = document.getElementById('categoryGrid');
    
    const categories = Object.entries(categoryStats);
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="loading">No category data available</div>';
        return;
    }
    
    // Sort by total revenue
    categories.sort((a, b) => b[1].totalRevenue - a[1].totalRevenue);
    
    container.innerHTML = categories.map(([category, stats]) => {
        return `
            <div class="category-card">
                <div class="category-name">${category}</div>
                <div class="category-stats">
                    <div class="category-stat">
                        <span class="category-stat-label">Items:</span>
                        <span class="category-stat-value">${stats.count}</span>
                    </div>
                    <div class="category-stat">
                        <span class="category-stat-label">Total Bids:</span>
                        <span class="category-stat-value">${stats.totalBids}</span>
                    </div>
                    <div class="category-stat">
                        <span class="category-stat-label">Revenue:</span>
                        <span class="category-stat-value">$${stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div class="category-stat">
                        <span class="category-stat-label">Avg/Item:</span>
                        <span class="category-stat-value">$${stats.count > 0 ? Math.round(stats.totalRevenue / stats.count) : 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Display recent activity
function displayRecentActivity(activity) {
    document.getElementById('last24Hours').textContent = activity.last24Hours.toLocaleString();
    document.getElementById('last7Days').textContent = activity.last7Days.toLocaleString();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchAnalytics();
    
    // Refresh data every 30 seconds
    setInterval(fetchAnalytics, 30000);
});
