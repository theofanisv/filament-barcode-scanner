<?php

namespace Theograms\FilamentBarcodeScanner;

use Filament\Support\Assets\AlpineComponent;
use Filament\Support\Facades\FilamentAsset;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class FilamentBarcodeScannerServiceProvider extends PackageServiceProvider
{
    public static string $name = 'filament-barcode-scanner';

    public function configurePackage(Package $package): void
    {
        $package
            ->name(static::$name)
            ->hasViews();
    }

    public function packageBooted(): void
    {
        // The scanner is an Alpine component that Filament fetches on demand: the button's view asks for it when the
        // button is first pressed. Registered as a plain script, its 400 KB were printed on every page of every
        // panel of the app, whether a page had a scan button or not.
        FilamentAsset::register([
                AlpineComponent::make(
                    'barcode-scanner',
                    __DIR__ . '/../resources/dist/barcode-scanner.js'
                ),
            ],
            'theofanisv/filament-barcode-scanner'
        );
    }
}
