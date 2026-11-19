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

    public function packageRegistered(): void
    {
        // The popup's texts, as resources/lang/<locale>.json; an app's own lang/<locale>.json overrides them. Added
        // here and not with hasTranslations(), which adds them at boot: Laravel reads a locale's JSON lines once, the
        // first time anything is translated, and another provider may well translate something before this one boots.
        $this->loadJsonTranslationsFrom(__DIR__ . '/../resources/lang');
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
