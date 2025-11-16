<?php

namespace Theograms\FilamentBarcodeScanner;

use Filament\Support\Assets\Js;
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
        FilamentAsset::register([
                Js::make(
                    'barcode-scanner',
                    __DIR__ . '/../resources/dist/barcode-scanner.js'
                ),
            ],
            'theofanisv/filament-barcode-scanner'
        );
    }
}
