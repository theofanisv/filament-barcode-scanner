export default function barcodeScannerComponent({
    targetField = null,
    scannerConfig = {},
    autoStop = true
}) {
    return {
        isScanning: false,
        scannerStarted: false,
        html5QrCode: null,
        cameras: [],
        selectedCamera: null,
        statusMessage: '',
        statusType: 'info',
        isProcessing: false,

        /**
         * Initialize the component
         */
        init() {
            // Ensure library is loaded
            this.ensureLibraryLoaded();
        },

        /**
         * Load html5-qrcode library dynamically
         */
        async ensureLibraryLoaded() {
            if (typeof Html5Qrcode !== 'undefined') {
                return Promise.resolve();
            }

            return new Promise((resolve, reject) => {
                // Check if script already added
                const existingScript = document.querySelector('script[src*="html5-qrcode"]');
                if (existingScript) {
                    existingScript.addEventListener('load', resolve);
                    existingScript.addEventListener('error', reject);
                    return;
                }

                const script = document.createElement('script');
                script.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js';
                script.async = true;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Failed to load html5-qrcode library'));
                document.head.appendChild(script);
            });
        },

        /**
         * Open scanner modal and initialize
         */
        async openScanner() {
            try {
                this.isScanning = true;
                this.statusMessage = 'Loading camera...';
                this.statusType = 'info';

                // Ensure library is loaded
                await this.ensureLibraryLoaded();

                // Get available cameras
                await this.loadCameras();

                // Auto-start if only one camera or mobile
                if (this.cameras.length === 1 || this.isMobileDevice()) {
                    await this.startScanning();
                }
            } catch (error) {
                console.error('Error opening scanner:', error);
                this.setStatus('Failed to access camera. Please check permissions.', 'error');
            }
        },

        /**
         * Load available cameras
         */
        async loadCameras() {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (!devices || devices.length === 0) {
                    throw new Error('No cameras found on this device');
                }

                this.cameras = devices;
                // Prefer back camera on mobile
                const backCamera = devices.find(d =>
                    d.label.toLowerCase().includes('back') ||
                    d.label.toLowerCase().includes('rear')
                );
                this.selectedCamera = backCamera ? backCamera.id : devices[0].id;
            } catch (error) {
                console.error('Error loading cameras:', error);
                throw new Error('Unable to access cameras. Please ensure you have granted camera permissions.');
            }
        },

        /**
         * Start the barcode scanner
         */
        async startScanning() {
            if (this.scannerStarted) return;

            try {
                // Initialize scanner if not already done
                if (!this.html5QrCode) {
                    this.html5QrCode = new Html5Qrcode("barcode-reader");
                }

                // Determine camera config
                const cameraConfig = this.isMobileDevice()
                    ? { facingMode: "environment" }
                    : this.selectedCamera;

                // Start scanning
                await this.html5QrCode.start(
                    cameraConfig,
                    {
                        fps: scannerConfig.fps || 10,
                        qrbox: scannerConfig.qrbox || { width: 250, height: 250 },
                        aspectRatio: scannerConfig.aspectRatio || 1.0,
                        disableFlip: scannerConfig.disableFlip || false,
                    },
                    this.onScanSuccess.bind(this),
                    this.onScanError.bind(this)
                );

                this.scannerStarted = true;
                this.setStatus('Point camera at barcode...', 'info');
            } catch (error) {
                console.error('Error starting scanner:', error);
                this.setStatus('Failed to start camera. Please try again.', 'error');
                this.scannerStarted = false;
            }
        },

        /**
         * Handle successful scan
         */
        async onScanSuccess(decodedText, decodedResult) {
            // Prevent multiple simultaneous scans
            if (this.isProcessing) return;
            this.isProcessing = true;

            console.log('Barcode scanned:', decodedText, decodedResult);

            // Stop scanner if auto-stop is enabled
            if (autoStop) {
                await this.stopScanning();
            }

            // Update target field
            if (targetField) {
                this.updateTargetField(decodedText);
            }

            // Show success message
            this.setStatus(`Scanned: ${decodedText}`, 'success');

            // Close modal after short delay if auto-stop
            if (autoStop) {
                setTimeout(() => {
                    this.isScanning = false;
                    this.isProcessing = false;
                }, 500);
            } else {
                this.isProcessing = false;
            }
        },

        /**
         * Handle scan errors (called frequently, usually ignorable)
         */
        onScanError(errorMessage) {
            // Errors are normal when no code is detected
            // Only log significant errors
            if (!errorMessage.includes('No MultiFormat Readers')) {
                console.debug('Scan error:', errorMessage);
            }
        },

        /**
         * Stop the scanner
         */
        async stopScanning() {
            if (this.html5QrCode && this.scannerStarted) {
                try {
                    await this.html5QrCode.stop();
                    this.scannerStarted = false;
                } catch (error) {
                    console.error('Error stopping scanner:', error);
                }
            }
            this.isScanning = false;
            this.statusMessage = '';
        },

        /**
         * Update the target form field value
         */
        updateTargetField(value) {
            if (!targetField) return;

            try {
                // Use Livewire's $wire to update the field
                // The targetField should be the field name (e.g., 'barcode', 'product_code')
                this.$wire.set(targetField, value);

                // Alternative: Use $wire.$set for nested fields
                // this.$wire.$set(targetField, value);

                // Dispatch event for other listeners
                this.$dispatch('barcode-scanned', {
                    field: targetField,
                    value: value
                });
            } catch (error) {
                console.error('Error updating field:', error);
                this.setStatus('Scanned successfully, but failed to update field', 'error');
            }
        },

        /**
         * Set status message
         */
        setStatus(message, type = 'info') {
            this.statusMessage = message;
            this.statusType = type;
        },

        /**
         * Check if mobile device
         */
        isMobileDevice() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        /**
         * Cleanup when component is destroyed
         */
        destroy() {
            this.stopScanning();
        }
    }
}
