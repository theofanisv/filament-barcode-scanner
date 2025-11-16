import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

function barcodeScannerComponent({
    targetField = null,
    scannerConfig = {},
    autoStop = true
}) {
    return {
        isScanning: false,
        scannerStarted: false,
        codeReader: null,
        cameras: [],
        selectedCamera: null,
        statusMessage: '',
        statusType: 'info',
        isProcessing: false,

        /**
         * Initialize the component
         */
        init() {
            // Initialize code reader
            this.codeReader = new BrowserMultiFormatReader();
        },

        /**
         * Open scanner modal and initialize
         */
        async openScanner() {
            try {
                this.isScanning = true;
                this.statusMessage = 'Loading camera...';
                this.statusType = 'info';

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
                const devices = await this.codeReader.listVideoInputDevices();
                if (!devices || devices.length === 0) {
                    throw new Error('No cameras found on this device');
                }

                this.cameras = devices.map(device => ({
                    id: device.deviceId,
                    label: device.label
                }));

                // Prefer back camera on mobile
                const backCamera = this.cameras.find(d =>
                    d.label.toLowerCase().includes('back') ||
                    d.label.toLowerCase().includes('rear')
                );
                this.selectedCamera = backCamera ? backCamera.id : this.cameras[0].id;
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
                const videoElement = document.getElementById('barcode-reader');

                // Determine camera ID
                const deviceId = this.isMobileDevice() && !this.selectedCamera
                    ? undefined  // Let browser choose back camera
                    : this.selectedCamera;

                // Start continuous decoding from video device
                await this.codeReader.decodeFromVideoDevice(
                    deviceId,
                    videoElement,
                    (result, error) => {
                        if (result) {
                            this.onScanSuccess(result.getText(), result);
                        }
                        if (error && !(error instanceof NotFoundException)) {
                            this.onScanError(error.message);
                        }
                    }
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
            if (this.codeReader && this.scannerStarted) {
                try {
                    this.codeReader.reset();
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

// Make available globally
window.barcodeScannerComponent = barcodeScannerComponent;
