// Audio Recording Module
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.isSupported = this.checkBrowserSupport();
        this.recordingStartTime = null;
        this.maxRecordingTime = 60000; // 60 seconds max
        this.minRecordingTime = 1000; // 1 second min
    }

    // Check browser support for audio recording
    checkBrowserSupport() {
        const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
        const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        
        if (!hasMediaRecorder) {
            console.warn('MediaRecorder API not supported');
            return false;
        }
        
        if (!hasGetUserMedia) {
            console.warn('getUserMedia API not supported');
            return false;
        }

        // Check for WebM support (required by backend)
        const supportedTypes = [
            'audio/webm',
            'audio/webm;codecs=opus',
            'audio/mp4',
            'audio/mpeg'
        ];

        for (const type of supportedTypes) {
            if (MediaRecorder.isTypeSupported(type)) {
                this.supportedMimeType = type;
                break;
            }
        }

        if (!this.supportedMimeType) {
            console.warn('No supported audio format found');
            return false;
        }

        return true;
    }

    // Request microphone permission
    async requestMicrophonePermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });
            
            // Test that we can actually record
            const testRecorder = new MediaRecorder(stream);
            testRecorder.stop();
            
            // Stop the test stream
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            console.error('Microphone permission error:', error);
            
            if (error.name === 'NotAllowedError') {
                throw new Error('Microphone permission denied. Please allow microphone access and try again.');
            } else if (error.name === 'NotFoundError') {
                throw new Error('No microphone found. Please connect a microphone and try again.');
            } else if (error.name === 'NotReadableError') {
                throw new Error('Microphone is being used by another application.');
            } else {
                throw new Error(`Microphone access failed: ${error.message}`);
            }
        }
    }

    // Start recording
    async startRecording() {
        if (!this.isSupported) {
            throw new Error('Audio recording is not supported in this browser. Please use Chrome, Firefox, or Edge.');
        }

        if (this.isRecording) {
            throw new Error('Recording is already in progress');
        }

        try {
            // Request fresh stream for recording
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });

            // Create MediaRecorder with optimal settings
            const options = {
                mimeType: this.supportedMimeType,
                audioBitsPerSecond: 128000 // 128 kbps for good quality
            };

            this.mediaRecorder = new MediaRecorder(this.audioStream, options);
            this.audioChunks = [];

            // Set up event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.isRecording = false;
                this.stopAudioStream();
            };

            this.mediaRecorder.onerror = (event) => {
                console.error('MediaRecorder error:', event.error);
                this.stopRecording();
                throw new Error(`Recording failed: ${event.error.message}`);
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.recordingStartTime = Date.now();

            // Auto-stop after max recording time
            setTimeout(() => {
                if (this.isRecording) {
                    console.warn('Auto-stopping recording after maximum time');
                    this.stopRecording();
                }
            }, this.maxRecordingTime);

            return true;
        } catch (error) {
            this.cleanup();
            throw error;
        }
    }

    // Stop recording
    async stopRecording() {
        if (!this.isRecording || !this.mediaRecorder) {
            throw new Error('No recording in progress');
        }

        const recordingDuration = Date.now() - this.recordingStartTime;
        
        if (recordingDuration < this.minRecordingTime) {
            this.cleanup();
            throw new Error('Recording too short. Please speak for at least 1 second.');
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Recording stop timeout'));
            }, 5000);

            this.mediaRecorder.onstop = () => {
                clearTimeout(timeout);
                this.isRecording = false;
                this.stopAudioStream();
                
                try {
                    const audioBlob = this.createAudioBlob();
                    resolve(audioBlob);
                } catch (error) {
                    reject(error);
                }
            };

            this.mediaRecorder.stop();
        });
    }

    // Create audio blob from recorded chunks
    createAudioBlob() {
        if (this.audioChunks.length === 0) {
            throw new Error('No audio data recorded');
        }

        const audioBlob = new Blob(this.audioChunks, { 
            type: this.supportedMimeType 
        });

        if (audioBlob.size === 0) {
            throw new Error('Empty audio recording');
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (audioBlob.size > maxSize) {
            throw new Error('Recording too large. Please keep recordings under 60 seconds.');
        }

        return audioBlob;
    }

    // Stop audio stream
    stopAudioStream() {
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => {
                track.stop();
            });
            this.audioStream = null;
        }
    }

    // Clean up resources
    cleanup() {
        this.isRecording = false;
        this.stopAudioStream();
        this.audioChunks = [];
        this.mediaRecorder = null;
        this.recordingStartTime = null;
    }

    // Get recording duration
    getRecordingDuration() {
        if (!this.recordingStartTime) return 0;
        return Date.now() - this.recordingStartTime;
    }

    // Check if currently recording
    getIsRecording() {
        return this.isRecording;
    }

    // Get supported audio format
    getSupportedMimeType() {
        return this.supportedMimeType;
    }

    // Create audio file from blob for upload
    createAudioFile(audioBlob, filename = 'recording.webm') {
        return new File([audioBlob], filename, {
            type: audioBlob.type,
            lastModified: Date.now()
        });
    }

    // Test microphone levels (for UI feedback)
    async testMicrophoneLevel() {
        if (!this.audioStream) return 0;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(this.audioStream);
            
            analyser.fftSize = 256;
            microphone.connect(analyser);
            
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            
            // Calculate average volume
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
            
            // Clean up
            microphone.disconnect();
            audioContext.close();
            
            return Math.round((average / 255) * 100); // Return as percentage
        } catch (error) {
            console.warn('Could not test microphone level:', error);
            return 0;
        }
    }
}

// Audio utilities
const AudioUtils = {
    // Format recording duration for display
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        return `${remainingSeconds}s`;
    },

    // Check if browser supports audio recording
    isBrowserSupported() {
        return !!(
            navigator.mediaDevices &&
            navigator.mediaDevices.getUserMedia &&
            window.MediaRecorder
        );
    },

    // Get user-friendly browser compatibility message
    getBrowserCompatibilityMessage() {
        if (!navigator.mediaDevices) {
            return 'Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.';
        }
        
        if (!navigator.mediaDevices.getUserMedia) {
            return 'Microphone access is not available. Please use HTTPS or a supported browser.';
        }
        
        if (!window.MediaRecorder) {
            return 'Audio recording is not supported in this browser. Please update your browser or try Chrome/Firefox.';
        }
        
        return 'Audio recording is supported!';
    },

    // Detect mobile device for touch-optimized UI
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
};

// Export for use in other modules
window.AudioRecorder = AudioRecorder;
window.AudioUtils = AudioUtils;