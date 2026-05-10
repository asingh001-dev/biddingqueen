// Configuration
const API_URL = window.location.origin;
const WS_URL = window.location.protocol === 'https:' 
    ? `wss://${window.location.host}` 
    : `ws://${window.location.host}`;

// State
let allAuctions = [];
let filteredAuctions = [];
let currentStatus = 'live';
let currentAuctionId = null;
let currentAuction = null;
let ws = null;
let searchTerm = '';
let currentImages = [];
let currentImageIndex = 0;

// DOM Elements
const statusTabs = document.querySelectorAll('.status-tab');
const auctionDropdown = document.getElementById('auctionDropdown');
const itemsGridEl = document.getElementById('itemsGrid');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('bidModal');
const closeModal = document.querySelector('.close');
const placeBidBtn = document.getElementById('placeBidBtn');
const bidderNameInput = document.getElementById('bidderName');
const connectionStatusEl = document.getElementById('connectionStatus');
const connectionTextEl = document.getElementById('connectionText');

// Initialize WebSocket
function initWebSocket() {
    ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
        console.log('WebSocket connected');
        updateConnectionStatus(true);
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
        updateConnectionStatus(false);
        setTimeout(initWebSocket, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        updateConnectionStatus(false);
    };
}

// Handle WebSocket messages
function handleWebSocketMessage(data) {
    if (data.type === 'BID_UPDATE') {
        updateItemBid(data);
    }
}

// Update connection status
function updateConnectionStatus(connected) {
    if (connected) {
        connectionStatusEl.className = 'status-indicator connected';
        connectionTextEl.textContent = 'Live Updates Active';
    } else {
        connectionStatusEl.className = 'status-indicator disconnected';
        connectionTextEl.textContent = 'Reconnecting...';
    }
}

// Fetch statistics
async function fetchStats() {
    try {
        const response = await fetch(`${API_URL}/api/stats`);
        const stats = await response.json();
        
        document.getElementById('liveAuctionsCount').textContent = stats.liveAuctions;
        document.getElementById('activeItemsCount').textContent = stats.activeItems;
        document.getElementById('totalAuctionsCount').textContent = stats.totalAuctions;
        
        document.getElementById('liveCount').textContent = stats.liveAuctions;
        document.getElementById('upcomingCount').textContent = stats.upcomingAuctions;
        document.getElementById('pastCount').textContent = stats.pastAuctions;
    } catch (error) {
        console.error('Error fetching stats:', error);
    }
}

// Fetch auctions by status
async function fetchAuctionsByStatus(status) {
    try {
        const response = await fetch(`${API_URL}/api/auctions?status=${status}`);
        const auctions = await response.json();
        return auctions;
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return [];
    }
}

// Fetch all auctions
async function fetchAllAuctions() {
    try {
        const response = await fetch(`${API_URL}/api/auctions`);
        allAuctions = await response.json();
        return allAuctions;
    } catch (error) {
        console.error('Error fetching auctions:', error);
        return [];
    }
}

// Select status tab
async function selectStatus(status) {
    currentStatus = status;
    
    // Update active tab
    statusTabs.forEach(tab => {
        if (tab.dataset.status === status) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update title
    const statusTitles = {
        live: 'Live Auctions',
        upcoming: 'Upcoming Auctions',
        past: 'Past Auctions (Completed)'
    };
    document.getElementById('statusTitle').textContent = statusTitles[status];
    
    // Fetch and display auctions for this status
    filteredAuctions = await fetchAuctionsByStatus(status);
    populateAuctionDropdown();
    
    // Select first auction if available
    if (filteredAuctions.length > 0) {
        selectAuction(filteredAuctions[0].id);
    } else {
        itemsGridEl.innerHTML = `<p class="loading">No ${status} auctions available</p>`;
        clearAuctionInfo();
    }
}

// Populate auction dropdown
function populateAuctionDropdown() {
    auctionDropdown.innerHTML = '';
    
    if (filteredAuctions.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No auctions available';
        auctionDropdown.appendChild(option);
        return;
    }
    
    filteredAuctions.forEach(auction => {
        const option = document.createElement('option');
        option.value = auction.id;
        option.textContent = auction.title;
        auctionDropdown.appendChild(option);
    });
}

// Select auction
function selectAuction(auctionId) {
    currentAuctionId = auctionId;
    currentAuction = filteredAuctions.find(a => a.id === auctionId);
    
    if (!currentAuction) return;
    
    // Update dropdown
    auctionDropdown.value = auctionId;
    
    // Update auction info
    updateAuctionInfo(currentAuction);
    
    // Display items
    renderItems(currentAuction.items);
}

// Update auction info display
function updateAuctionInfo(auction) {
    document.getElementById('currentAuctionTitle').textContent = auction.title;
    
    const startTime = new Date(auction.startTime);
    const endTime = new Date(auction.endTime);
    
    document.getElementById('auctionStartTime').textContent = startTime.toLocaleString();
    document.getElementById('auctionEndTime').textContent = endTime.toLocaleString();
    document.getElementById('auctionItemCount').textContent = auction.items.length;
    
    const statusBadge = document.getElementById('auctionStatus');
    statusBadge.textContent = auction.status;
    statusBadge.className = `status-badge ${auction.status}`;
}

// Clear auction info
function clearAuctionInfo() {
    document.getElementById('auctionStartTime').textContent = '-';
    document.getElementById('auctionEndTime').textContent = '-';
    document.getElementById('auctionItemCount').textContent = '-';
    document.getElementById('auctionStatus').textContent = '-';
    document.getElementById('currentAuctionTitle').textContent = 'Select an auction';
}

// Render items
function renderItems(items) {
    // Apply search filter
    let displayItems = items;
    if (searchTerm) {
        displayItems = items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    if (displayItems.length === 0) {
        itemsGridEl.innerHTML = '<p class="loading">No items match your search</p>';
        return;
    }
    
    itemsGridEl.innerHTML = '';
    displayItems.forEach(item => {
        const card = createItemCard(item);
        itemsGridEl.appendChild(card);
    });
}

// Create item card
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    if (item.status === 'closed') {
        card.classList.add('closed');
    }
    card.onclick = () => openBidModal(item);
    
    const isPast = currentAuction.status === 'past';
    const nextBid = item.currentBid + 5;
    const endDate = new Date(item.endTime).toLocaleDateString();
    const endTime = new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const bidInfo = isPast 
        ? `<div style="margin-bottom: 1rem; text-align: center; padding: 0.5rem; background: #fee2e2; border-radius: 8px; color: #991b1b; font-weight: 600;">Final: $${item.finalBid || item.currentBid}</div>`
        : `<div style="margin-bottom: 1rem; display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary);">
            <span>${item.bidCount} bids</span>
            <span>Ends: ${endDate}</span>
          </div>`;
    
    card.innerHTML = `
        <img class="item-image" src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400'">
        <div class="item-content">
            <h3 class="item-name">${item.name}</h3>
            <p class="item-description">${item.description}</p>
            
            <div class="item-stats">
                <div>
                    <span class="stat-label">${isPast ? 'Final Bid' : 'Current Bid'}</span>
                    <div class="stat-value current-bid-value" data-item-id="${item.id}">$${item.currentBid}</div>
                </div>
                ${!isPast ? `<div style="text-align: right;">
                    <span class="stat-label">Next Bid</span>
                    <div class="stat-value">$${nextBid}</div>
                </div>` : ''}
            </div>
            
            ${bidInfo}
            
            <button class="btn-bid" onclick="event.stopPropagation(); openBidModal(${JSON.stringify(item).replace(/"/g, '&quot;')})" ${isPast ? 'disabled' : ''}>
                ${isPast ? '🏁 Auction Closed' : `Place Bid - $${nextBid}`}
            </button>
        </div>
    `;
    
    return card;
}

// Open bidding modal
function openBidModal(item) {
    const nextBid = item.currentBid + 5;
    const endDate = new Date(item.endTime).toLocaleString();
    const isPast = currentAuction.status === 'past';
    
    document.getElementById('modalItemName').textContent = item.name;
    document.getElementById('modalItemDescription').textContent = item.description;
    document.getElementById('modalCurrentBid').textContent = `$${item.currentBid}`;
    document.getElementById('modalNextBid').textContent = `$${nextBid}`;
    document.getElementById('modalBidCount').textContent = item.bidCount;
    document.getElementById('modalEndTime').textContent = endDate;
    
    // Setup image gallery
    currentImages = item.images || [item.image];
    currentImageIndex = 0;
    setupImageGallery();
    
    // Handle past auctions
    const biddingSection = document.getElementById('biddingSection');
    const closedSection = document.getElementById('closedSection');
    
    if (isPast) {
        biddingSection.style.display = 'none';
        closedSection.style.display = 'block';
        document.getElementById('finalBidAmount').textContent = `$${item.finalBid || item.currentBid}`;
    } else {
        biddingSection.style.display = 'block';
        closedSection.style.display = 'none';
    }
    
    // Store item data
    placeBidBtn.dataset.itemId = item.id;
    placeBidBtn.dataset.auctionId = currentAuctionId;
    
    // Clear previous messages
    document.getElementById('bidMessage').className = 'bid-message';
    document.getElementById('bidMessage').textContent = '';
    
    modal.style.display = 'block';
}

// Setup image gallery
function setupImageGallery() {
    const mainImage = document.getElementById('modalItemImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    
    // Set main image with error handling
    mainImage.src = currentImages[currentImageIndex];
    mainImage.onerror = function() {
        // Fallback to a placeholder if image fails to load
        this.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
    };
    
    // Clear and populate thumbnails
    thumbnailContainer.innerHTML = '';
    currentImages.forEach((img, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = img;
        thumbnail.className = 'thumbnail' + (index === currentImageIndex ? ' active' : '');
        thumbnail.alt = `Image ${index + 1}`;
        thumbnail.onclick = () => showImage(index);
        // Add error handling for thumbnails
        thumbnail.onerror = function() {
            this.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
        };
        thumbnailContainer.appendChild(thumbnail);
    });
    
    // Show/hide navigation arrows based on image count
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    if (currentImages.length <= 1) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
    }
}

// Show specific image
function showImage(index) {
    currentImageIndex = index;
    const mainImage = document.getElementById('modalItemImage');
    mainImage.src = currentImages[currentImageIndex];
    
    // Update thumbnail active state
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach((thumb, i) => {
        if (i === index) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

// Navigate to previous image
function previousImage() {
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    showImage(currentImageIndex);
}

// Navigate to next image
function nextImage() {
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    showImage(currentImageIndex);
}

// Close modal
closeModal.onclick = () => {
    modal.style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Place bid
placeBidBtn.onclick = async () => {
    const itemId = parseInt(placeBidBtn.dataset.itemId);
    const auctionId = parseInt(placeBidBtn.dataset.auctionId);
    const bidderName = bidderNameInput.value.trim();
    
    placeBidBtn.disabled = true;
    placeBidBtn.textContent = 'Placing Bid...';
    
    try {
        const response = await fetch(`${API_URL}/api/auctions/${auctionId}/items/${itemId}/bid`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bidderName })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showBidMessage(result.message, 'success');
            
            setTimeout(() => {
                document.getElementById('modalCurrentBid').textContent = `$${result.item.currentBid}`;
                document.getElementById('modalNextBid').textContent = `$${result.item.currentBid + 5}`;
                document.getElementById('modalBidCount').textContent = result.item.bidCount;
            }, 500);
        } else {
            showBidMessage(result.error || 'Failed to place bid', 'error');
        }
    } catch (error) {
        console.error('Error placing bid:', error);
        showBidMessage('Failed to place bid. Please try again.', 'error');
    } finally {
        placeBidBtn.disabled = false;
        placeBidBtn.textContent = 'Place Bid';
    }
};

// Show bid message
function showBidMessage(message, type) {
    const messageEl = document.getElementById('bidMessage');
    messageEl.className = `bid-message ${type}`;
    messageEl.textContent = message;
    
    if (type === 'success') {
        setTimeout(() => {
            messageEl.className = 'bid-message';
        }, 3000);
    }
}

// Update item bid in real-time
function updateItemBid(data) {
    const auction = filteredAuctions.find(a => a.id === data.auctionId);
    if (auction) {
        const item = auction.items.find(i => i.id === data.itemId);
        if (item) {
            item.currentBid = data.currentBid;
            item.bidCount = data.bidCount;
            
            if (currentAuctionId === data.auctionId) {
                const bidElement = document.querySelector(`[data-item-id="${data.itemId}"]`);
                if (bidElement) {
                    bidElement.textContent = `$${data.currentBid}`;
                    bidElement.style.animation = 'none';
                    setTimeout(() => {
                        bidElement.style.animation = 'pulse 0.5s ease';
                    }, 10);
                }
            }
        }
    }
}

// Search functionality
searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value;
    if (currentAuction) {
        renderItems(currentAuction.items);
    }
});

// Dropdown change handler
auctionDropdown.addEventListener('change', (e) => {
    const auctionId = parseInt(e.target.value);
    if (auctionId) {
        selectAuction(auctionId);
    }
});

// Status tab click handlers
statusTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        selectStatus(tab.dataset.status);
    });
});

// Image gallery navigation
document.getElementById('prevImage').addEventListener('click', (e) => {
    e.stopPropagation();
    previousImage();
});

document.getElementById('nextImage').addEventListener('click', (e) => {
    e.stopPropagation();
    nextImage();
});

// Keyboard navigation for image gallery
document.addEventListener('keydown', (e) => {
    if (modal.style.display === 'block') {
        if (e.key === 'ArrowLeft') {
            previousImage();
        } else if (e.key === 'ArrowRight') {
            nextImage();
        }
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    initWebSocket();
    await fetchAllAuctions();
    await fetchStats();
    await selectStatus('live'); // Start with live auctions
    
    // Refresh data periodically
    setInterval(fetchStats, 30000);
    setInterval(async () => {
        await selectStatus(currentStatus);
    }, 60000);
});
