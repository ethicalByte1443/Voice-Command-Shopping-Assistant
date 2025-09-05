// Main Application Module
class VoiceShoppingApp {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8000';
        this.username = 'default_user';
        this.audioRecorder = null;
        this.isRecording = false;
        this.pendingAction = null;
        
        // Initialize components
        this.ui = new UIManager();
        this.audioRecorder = new AudioRecorder();
        
        // Bind methods
        this.handleVoiceCommand = this.handleVoiceCommand.bind(this);
        this.confirmAction = this.confirmAction.bind(this);
        this.cancelAction = this.cancelAction.bind(this);
        
        this.init();
    }

    async init() {
        try {
            // Initialize UI components
            this.setupEventListeners();
            
            // Load initial data
            await this.loadWishlist();
            await this.loadRecommendations();
            
            // Initialize audio (check browser support)
            if (!this.audioRecorder.isSupported) {
                throw new Error('Audio recording not supported in this browser');
            }
            
            this.ui.showNotification('Voice Shopping Assistant ready!', 'success');
        } catch (error) {
            console.error('Initialization error:', error);
            this.ui.showNotification('Failed to initialize app', 'error');
        }
    }

    setupEventListeners() {
        // Voice recording button
        const recordBtn = document.getElementById('recordBtn');
        if (recordBtn) {
            recordBtn.addEventListener('click', this.toggleRecording.bind(this));
        }

        // Confirmation dialog buttons
        const confirmBtn = document.getElementById('confirmBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (confirmBtn) confirmBtn.addEventListener('click', this.confirmAction);
        if (cancelBtn) cancelBtn.addEventListener('click', this.cancelAction);

        // Custom events from UI
        window.addEventListener('removeItem', (event) => {
            this.removeItem(event.detail.product);
        });

        window.addEventListener('addRecommendation', (event) => {
            // Find the full product object from recommendations
            const productName = event.detail.product;
            this.addRecommendedItemByName(productName);
        });

        // Refresh buttons
        const refreshWishlistBtn = document.getElementById('refreshWishlist');
        const refreshRecsBtn = document.getElementById('refreshRecommendations');
        
        if (refreshWishlistBtn) {
            refreshWishlistBtn.addEventListener('click', () => this.loadWishlist());
        }
        if (refreshRecsBtn) {
            refreshRecsBtn.addEventListener('click', () => this.loadRecommendations());
        }
    }

    async toggleRecording() {
        if (this.isRecording) {
            await this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            this.isRecording = true;
            this.ui.updateRecordingState(true);
            
            await this.audioRecorder.startRecording();
            
        } catch (error) {
            console.error('Recording start error:', error);
            this.ui.showNotification('Failed to start recording: ' + error.message, 'error');
            this.isRecording = false;
            this.ui.updateRecordingState(false);
        }
    }

    async stopRecording() {
        try {
            this.isRecording = false;
            this.ui.updateRecordingState(false);
            this.ui.showProcessingState('Processing voice command...');
            
            const audioBlob = await this.audioRecorder.stopRecording();
            await this.handleVoiceCommand(audioBlob);
            
        } catch (error) {
            console.error('Recording stop error:', error);
            this.ui.showNotification('Failed to process recording: ' + error.message, 'error');
        } finally {
            this.ui.hideProcessingState();
        }
    }

    async handleVoiceCommand(audioBlob) {
        try {
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');

            const response = await fetch(`${this.baseURL}/recognise_text_to_llm`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            // Display transcription
            this.ui.displayTranscription(result.recognized_text, result.normalized_text);

            // Show confirmation dialog
            this.pendingAction = result.llm_response;
            this.ui.showConfirmationDialog(result.llm_response);

        } catch (error) {
            console.error('Voice command error:', error);
            this.ui.showNotification('Failed to process voice command: ' + error.message, 'error');
        }
    }

    async confirmAction() {
        if (!this.pendingAction) return;

        try {
            this.ui.showProcessingState('Updating wishlist...');

            const response = await fetch(`${this.baseURL}/update_wishlist/${this.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.pendingAction)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            this.ui.showNotification(result.message, 'success');
            this.ui.hideConfirmationDialog();
            
            // Refresh data
            await this.loadWishlist();
            await this.loadRecommendations();

        } catch (error) {
            console.error('Confirm action error:', error);
            this.ui.showNotification('Failed to update wishlist: ' + error.message, 'error');
        } finally {
            this.pendingAction = null;
            this.ui.hideProcessingState();
        }
    }

    cancelAction() {
        this.pendingAction = null;
        this.ui.hideConfirmationDialog();
        this.ui.showNotification('Action cancelled', 'info');
    }

    async loadWishlist() {
        try {
            this.ui.showWishlistLoading(true);

            const response = await fetch(`${this.baseURL}/wishlist/${this.username}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.ui.displayWishlist(result.wishlist || []);

        } catch (error) {
            console.error('Load wishlist error:', error);
            this.ui.showNotification('Failed to load wishlist', 'error');
            this.ui.displayWishlist([]);
        } finally {
            this.ui.showWishlistLoading(false);
        }
    }

    async loadRecommendations() {
        try {
            this.ui.showRecommendationsLoading(true);

            const response = await fetch(`${this.baseURL}/recommendations/${this.username}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            this.ui.displayRecommendations(result.recommendations || []);

        } catch (error) {
            console.error('Load recommendations error:', error);
            this.ui.showNotification('Failed to load recommendations', 'error');
            this.ui.displayRecommendations([]);
        } finally {
            this.ui.showRecommendationsLoading(false);
        }
    }

    async removeItem(product) {
        try {
            this.ui.showProcessingState('Removing item...');

            const removeAction = {
                product: product,
                quantity: 1,
                category: 'unknown',
                action: 'remove',
                status: 'manual_removal'
            };

            const response = await fetch(`${this.baseURL}/update_wishlist/${this.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(removeAction)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            this.ui.showNotification(result.message, 'success');
            
            // Refresh data
            await this.loadWishlist();
            await this.loadRecommendations();

        } catch (error) {
            console.error('Remove item error:', error);
            this.ui.showNotification('Failed to remove item: ' + error.message, 'error');
        } finally {
            this.ui.hideProcessingState();
        }
    }

    async addRecommendedItem(product) {
        try {
            this.ui.showProcessingState('Adding recommended item...');

            const addAction = {
                product: product.product,
                quantity: 1,
                category: product.category || 'unknown',
                action: 'add',
                status: 'recommendation_added'
            };

            const response = await fetch(`${this.baseURL}/update_wishlist/${this.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addAction)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            this.ui.showNotification(result.message, 'success');
            
            // Refresh data
            await this.loadWishlist();
            await this.loadRecommendations();

        } catch (error) {
            console.error('Add recommended item error:', error);
            this.ui.showNotification('Failed to add item: ' + error.message, 'error');
        } finally {
            this.ui.hideProcessingState();
        }
    }

    async addRecommendedItemByName(productName) {
        try {
            this.ui.showProcessingState('Adding recommended item...');

            const addAction = {
                product: productName,
                quantity: 1,
                category: 'unknown',
                action: 'add',
                status: 'recommendation_added'
            };

            const response = await fetch(`${this.baseURL}/update_wishlist/${this.username}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addAction)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.error) {
                throw new Error(result.error);
            }

            this.ui.showNotification(result.message, 'success');
            
            // Refresh data
            await this.loadWishlist();
            await this.loadRecommendations();

        } catch (error) {
            console.error('Add recommended item error:', error);
            this.ui.showNotification('Failed to add item: ' + error.message, 'error');
        } finally {
            this.ui.hideProcessingState();
        }
    }
}
       
// /
// / Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Global app instance
    window.voiceShoppingApp = new VoiceShoppingApp();
    
    // Global functions for UI event handlers
    window.removeWishlistItem = (product) => {
        window.voiceShoppingApp.removeItem(product);
    };
    
    window.addRecommendedItem = (product) => {
        window.voiceShoppingApp.addRecommendedItem(product);
    };
    
    // Handle browser compatibility
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        document.getElementById('recordBtn').disabled = true;
        document.querySelector('.voice-controls').innerHTML = `
            <div class="error-message">
                <p>Voice recording is not supported in this browser.</p>
                <p>Please use Chrome, Firefox, or Edge for the best experience.</p>
            </div>
        `;
    }
    
    // Handle offline/online status
    window.addEventListener('online', () => {
        document.querySelector('.app-container').classList.remove('offline');
        window.voiceShoppingApp.ui.showNotification('Connection restored', 'success');
    });
    
    window.addEventListener('offline', () => {
        document.querySelector('.app-container').classList.add('offline');
        window.voiceShoppingApp.ui.showNotification('No internet connection', 'warning');
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.voiceShoppingApp && window.voiceShoppingApp.isRecording) {
        // Stop recording if page becomes hidden
        window.voiceShoppingApp.stopRecording();
    }
});

// Handle beforeunload to clean up resources
window.addEventListener('beforeunload', () => {
    if (window.voiceShoppingApp && window.voiceShoppingApp.audioRecorder) {
        window.voiceShoppingApp.audioRecorder.cleanup();
    }
});