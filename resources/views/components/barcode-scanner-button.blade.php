<div
    x-data="barcodeScannerComponent({
        targetField: @js($getTargetField()),
        scannerConfig: @js($getScannerConfig()),
        autoStop: @js($getAutoStop()),
    })"
    {{ $attributes->merge(['class' => 'filament-barcode-scanner']) }}
>
    <!-- Scanner Modal/Container -->
    <div
        x-show="isScanning"
        x-cloak
        class="fixed inset-0 z-50 overflow-y-auto"
        style="display: none;"
    >
        <!-- Backdrop -->
        <div
            class="fixed inset-0 bg-black/50 dark:bg-black/75"
            @click="stopScanning()"
        ></div>

        <!-- Modal -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
            <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
                <!-- Header -->
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                        {{__('Scan Barcode')}}
                    </h3>
                    <button
                        type="button"
                        @click="stopScanning()"
                        class="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    >
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Scanner Container -->
                <video id="barcode-reader" class="rounded-lg overflow-hidden bg-black w-full"></video>

                <!-- Status Message -->
                <div x-show="statusMessage" class="mt-4 p-3 rounded-lg" :class="statusType === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'">
                    <p x-text="statusMessage"></p>
                </div>

                <!-- Camera Selection (optional, shown before scanning starts) -->
                <div x-show="!scannerStarted && cameras.length > 1" class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {{__('Select Camera')}}
                    </label>
                    <select
                        x-model="selectedCamera"
                        class="block w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                    >
                        <template x-for="camera in cameras" :key="camera.id">
                            <option :value="camera.id" x-text="camera.label"></option>
                        </template>
                    </select>
                </div>

                <!-- Start Button -->
                <div x-show="!scannerStarted" class="mt-4">
                    <button
                        type="button"
                        @click="startScanning()"
                        class="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium"
                    >
                        {{__('Start Camera')}}
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Trigger Button -->
    <x-filament::button
        :color="$getColor()"
        :icon="$getIcon()"
        type="button"
        @click="openScanner()"
    >
        {{ $getLabel() }}
    </x-filament::button>
</div>

