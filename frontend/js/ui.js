// UI Management Module
class UIManager {
    constructor() {
        this.elements = {};
        this.notifications = [];
        this.currentConfirmation = null;
        this.initializeElements();
    }

    // Initialize DOM element references
    initializeElements() {
        this.elements = {
            // Voice controls
            recordBtn: document.getElementById('recordBtn'),
            recordingIndicator: document.getElementById('recordingIndicator'),
            statusDisplay: document.getElementById('statusDisplay'),
            transcription: document.getElementById('transcription'),
            aiResponse: document.getElementById('aiResponse'),
            
            // Wishlist
            wishlistContainer: document.getElementById('wishlistContainer'),
            wishlistItems: document.getElementById('wishlistItems'),
            emptyState: document.getElementById('emptyState'),
            itemCount: document.getElementById('itemCount'),
            
            // Recommendations
            recommendationsContainer: document.getElementById('recommendationsContainer'),
            recommendationsGrid: document.getElementById('recommendationsGrid'),
            recommendationsLoading: document.getElementById('recommendationsLoading'),
            
            // Dialogs and overlays
            confirmationDialog: document.getElementById('confirmationDialog'),
            confirmationText: document.getElementById('confirmationText'),
            confirmBtn: document.getElementById('confirmBtn'),
            cancelBtn: document.getElementById('cancelBtn'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            
            // Notifications
            notifications: document.getElementById('notifications')
        };
    }

    // Voice Recording UI
    updateRecordingState(isRecording) {
        if (isRecording) {
            this.showRecordingState();
        } else {
            this.hideRecordingState();
        }
    }

    showRecordingState() {
        this.elements.recordBtn.classList.add('recording');
        this.elements.recordBtn.querySelector('.btn-text').textContent = 'Recording...';
        this.elements.recordingIndicator.classList.add('active');
        this.clearStatusDisplay();
    }

    hideRecordingState() {
        this.elements.recordBtn.classList.remove('recording');
        this.elements.recordBtn.querySelector('.btn-text').textContent = 'Tap to Speak';
        this.elements.recordingIndicator.classList.remove('active');
    }

    // Status Display Management
    displayTranscription(recognizedText, normalizedText) {
        this.showTranscription(recognizedText);
        if (normalizedText && normalizedText !== recognizedText) {
            this.elements.transcription.innerHTML += `<br><em>Processed as:</em> "${normalizedText}"`;
        }
    }

    showTranscription(text) {
        this.elements.transcription.innerHTML = `
            <strong>You said:</strong> "${text}"
        `;
        this.elements.transcription.classList.add('fade-in');
    }

    showAIResponse(response) {
        const { product, quantity, category, action } = response;
        this.elements.aiResponse.innerHTML = `
            <div class="ai-response-content">
                <strong>AI understood:</strong>
                <div class="response-details">
                    <span class="action-badge ${action}">${action.toUpperCase()}</span>
                    <span class="product-name">${product}</span>
                    ${quantity > 1 ? `<span class="quantity">×${quantity}</span>` : ''}
                    <span class="category-tag">${category}</span>
                </div>
            </div>
        `;
        this.elements.aiResponse.classList.add('fade-in');
    }

    clearStatusDisplay() {
        this.elements.transcription.innerHTML = '';
        this.elements.aiResponse.innerHTML = '';
        this.elements.transcription.classList.remove('fade-in');
        this.elements.aiResponse.classList.remove('fade-in');
    }

    // Loading States
    showProcessingState(message = 'Processing your request...') {
        this.showLoadingOverlay(message);
    }

    hideProcessingState() {
        this.hideLoadingOverlay();
    }

    showLoadingOverlay(message = 'Processing your request...') {
        this.elements.loadingText.textContent = message;
        this.elements.loadingOverlay.classList.add('active');
    }

    hideLoadingOverlay() {
        this.elements.loadingOverlay.classList.remove('active');
    }

    // Confirmation Dialog
    showConfirmationDialog(llmResponse) {
        const { product, quantity, category, action } = llmResponse;
        const message = `${action.toUpperCase()} ${quantity > 1 ? quantity + ' ' : ''}${product} ${action === 'add' ? 'to' : 'from'} your shopping list?`;
        
        this.elements.confirmationText.innerHTML = `
            <div class="confirmation-details">
                <p>${message}</p>
                <div class="action-summary">
                    <span class="action-badge ${action}">${action.toUpperCase()}</span>
                    <span class="product-name">${product}</span>
                    ${quantity > 1 ? `<span class="quantity">×${quantity}</span>` : ''}
                    <span class="category-tag">${category}</span>
                </div>
            </div>
        `;
        this.elements.confirmationDialog.classList.add('active');
    }

    showConfirmationDialogWithCallback(message, onConfirm, onCancel) {
        this.elements.confirmationText.textContent = message;
        this.elements.confirmationDialog.classList.add('active');
        
        this.currentConfirmation = { onConfirm, onCancel };
        
        // Set up event listeners
        this.elements.confirmBtn.onclick = () => {
            this.hideConfirmationDialog();
            if (onConfirm) onConfirm();
        };
        
        this.elements.cancelBtn.onclick = () => {
            this.hideConfirmationDialog();
            if (onCancel) onCancel();
        };
    }

    hideConfirmationDialog() {
        this.elements.confirmationDialog.classList.remove('active');
        this.currentConfirmation = null;
    }

    // Wishlist Display
    displayWishlist(items) {
        this.renderWishlist(items);
    }

    showWishlistLoading(show) {
        if (show) {
            this.elements.wishlistContainer.classList.add('loading');
        } else {
            this.elements.wishlistContainer.classList.remove('loading');
        }
    }

    renderWishlist(items) {
        if (!items || items.length === 0) {
            this.showEmptyWishlist();
            return;
        }

        this.hideEmptyWishlist();
        this.updateItemCount(items.length);
        
        // Group items by category
        const groupedItems = this.groupItemsByCategory(items);
        
        let html = '';
        for (const [category, categoryItems] of Object.entries(groupedItems)) {
            html += this.renderCategoryGroup(category, categoryItems);
        }
        
        this.elements.wishlistItems.innerHTML = html;
        this.elements.wishlistItems.classList.add('fade-in');
        
        // Add event listeners for remove buttons
        this.attachRemoveButtonListeners();
    }

    groupItemsByCategory(items) {
        return items.reduce((groups, item) => {
            const category = item.category || 'Other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(item);
            return groups;
        }, {});
    }

    renderCategoryGroup(category, items) {
        const categoryIcon = this.getCategoryIcon(category);
        
        return `
            <div class="category-group">
                <div class="category-header">
                    ${categoryIcon}
                    <span class="category-name">${category}</span>
                    <span class="category-count">${items.length} item${items.length !== 1 ? 's' : ''}</span>
                </div>
                <div class="category-items">
                    ${items.map(item => this.renderWishlistItem(item)).join('')}
                </div>
            </div>
        `;
    }

    renderWishlistItem(item) {
        const itemIcon = this.getItemIcon(item.product);
        const timestamp = item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '';
        
        return `
            <div class="wishlist-item" data-product="${item.product}">
                <div class="item-info">
                    <div class="item-icon">${itemIcon}</div>
                    <div class="item-details">
                        <div class="item-name">${item.product}</div>
                        <div class="item-meta">
                            <span class="item-quantity">Qty: ${item.quantity || 1}</span>
                            <span class="item-category">${item.category || 'Other'}</span>
                            ${timestamp ? `<span class="item-date">${timestamp}</span>` : ''}
                        </div>
                    </div>
                </div>
                <div class="item-actions">
                    <button class="remove-btn" data-product="${item.product}" title="Remove item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    attachRemoveButtonListeners() {
        const removeButtons = this.elements.wishlistItems.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const productName = button.dataset.product;
                this.handleRemoveItem(productName);
            });
        });
    }

    handleRemoveItem(productName) {
        this.showConfirmationDialogWithCallback(
            `Remove "${productName}" from your shopping list?`,
            () => {
                // Emit custom event for app to handle
                window.dispatchEvent(new CustomEvent('removeItem', { 
                    detail: { product: productName } 
                }));
            }
        );
    }

    showEmptyWishlist() {
        this.elements.emptyState.style.display = 'block';
        this.elements.wishlistItems.style.display = 'none';
        this.updateItemCount(0);
    }

    hideEmptyWishlist() {
        this.elements.emptyState.style.display = 'none';
        this.elements.wishlistItems.style.display = 'block';
    }

    updateItemCount(count) {
        this.elements.itemCount.textContent = `${count} item${count !== 1 ? 's' : ''}`;
    }

    // Recommendations Display
    displayRecommendations(recommendations) {
        this.renderRecommendations(recommendations);
    }

    showRecommendationsLoading(show) {
        if (show) {
            this.elements.recommendationsLoading.style.display = 'flex';
            this.elements.recommendationsGrid.style.display = 'none';
        } else {
            this.elements.recommendationsLoading.style.display = 'none';
            this.elements.recommendationsGrid.style.display = 'grid';
        }
    }

    renderRecommendations(recommendations) {
        if (!recommendations || recommendations.length === 0) {
            this.showEmptyRecommendations();
            return;
        }

        this.hideRecommendationsLoading();
        
        const html = recommendations.map(item => this.renderRecommendationCard(item)).join('');
        this.elements.recommendationsGrid.innerHTML = html;
        this.elements.recommendationsGrid.classList.add('fade-in');
        
        // Add event listeners for recommendation cards
        this.attachRecommendationListeners();
    }

    renderRecommendationCard(item) {
        const price = item.price ? `$${item.price.toFixed(2)}` : '';
        
        return `
            <div class="recommendation-card" data-product="${item.product}">
                <button class="add-rec-btn" title="Add to list">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <div class="rec-item-name">${item.product}</div>
                <div class="rec-item-meta">
                    <span class="rec-item-category">${item.category || 'Other'}</span>
                    ${price ? `<span class="rec-item-price">${price}</span>` : ''}
                </div>
            </div>
        `;
    }

    attachRecommendationListeners() {
        const cards = this.elements.recommendationsGrid.querySelectorAll('.recommendation-card');
        cards.forEach(card => {
            const addBtn = card.querySelector('.add-rec-btn');
            const productName = card.dataset.product;
            
            const handleAdd = () => {
                window.dispatchEvent(new CustomEvent('addRecommendation', { 
                    detail: { product: productName } 
                }));
            };
            
            card.addEventListener('click', handleAdd);
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                handleAdd();
            });
        });
    }

    showRecommendationsLoading() {
        this.elements.recommendationsLoading.style.display = 'flex';
        this.elements.recommendationsGrid.style.display = 'none';
    }

    hideRecommendationsLoading() {
        this.elements.recommendationsLoading.style.display = 'none';
        this.elements.recommendationsGrid.style.display = 'grid';
    }

    showEmptyRecommendations() {
        this.hideRecommendationsLoading();
        this.elements.recommendationsGrid.innerHTML = `
            <div class="empty-recommendations">
                <p>No recommendations available. Add some items to your wishlist to get personalized suggestions!</p>
            </div>
        `;
    }

    // Notifications
    showNotification(message, type = 'info', duration = 5000) {
        const notification = this.createNotificationElement(message, type);
        this.elements.notifications.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        return notification;
    }

    createNotificationElement(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" title="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;
        
        // Add close button listener
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        return notification;
    }

    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    // Icon helpers
    getCategoryIcon(category) {
        const icons = {
            'dairy': '🥛',
            'produce': '🥕',
            'fruit': '🍎',
            'vegetables': '🥬',
            'meat': '🥩',
            'snacks': '🍿',
            'beverages': '🥤',
            'grains': '🌾',
            'bakery': '🍞',
            'frozen': '❄️',
            'other': '📦'
        };
        
        return icons[category.toLowerCase()] || icons.other;
    }

    getItemIcon(productName) {
        return productName.charAt(0).toUpperCase();
    }

    getNotificationIcon(type) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20,6 9,17 4,12"></polyline></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"></circle><path d="M12,16v-4"></path><path d="M12,8h.01"></path></svg>'
        };
        
        return icons[type] || icons.info;
    }
}

// Export for use in other modules
window.UIManager = UIManager;