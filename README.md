# Filament Barcode Scanner

A production-ready Filament v4 package for camera-based barcode and QR code scanning using smartphone cameras.

> [!NOTE]  
> This package is AI-generated!

## Features

- **Dynamic JavaScript Loading**: Assets load only when needed
- **Auto-Stop Functionality**: Automatically stops scanning after first successful scan
- **Mobile-Optimized**: Automatic back camera selection on mobile devices
- **Seamless Integration**: Updates Filament form fields via Livewire
- **Multiple Barcode Support**: Handles QR codes, EAN, UPC, and many other formats
- **Dark Mode Support**: Fully compatible with Filament's dark mode
- **Responsive Design**: Works on desktop and mobile devices
- **HTTPS Ready**: Full camera API support with proper SSL configuration

## Requirements

- PHP 8.1+
- Laravel 10+
- Filament v4
- HTTPS (required for camera access, except localhost)

## Installation

### Step 1: Install via Composer

```bash
composer require theofanisv/filament-barcode-scanner
```

### Step 2: Publish Assets

```bash
php artisan filament:assets
```

### Step 3: Clear Cache

```bash
php artisan optimize:clear
php artisan filament:optimize
```

## Usage

### Basic Example

Add the scanner button to any Filament form field:

```php
use Theograms\FilamentBarcodeScanner\Components\BarcodeScannerButton;
use Filament\Forms\Components\TextInput;

public static function form(Form $form): Form
{
    return $form
        ->schema([
            TextInput::make('barcode')
                ->label('Product Barcode')
                ->required()
                ->suffixAction(
                    BarcodeScannerButton::make()
                        ->targetField('barcode')
                        ->label('Scan')
                        ->icon('heroicon-o-camera')
                        ->color('primary')
                ),
        ]);
}
```

### Advanced Configuration

Customize scanner behavior and appearance:

```php
BarcodeScannerButton::make()
    ->targetField('product_code')
    ->label('Scan Product')
    ->icon('heroicon-o-qr-code')
    ->color('success')
    ->autoStop(true)
    ->scannerConfig([
        'fps' => 15,
        'qrbox' => ['width' => 300, 'height' => 200],
        'aspectRatio' => 1.5,
        'disableFlip' => false,
    ])
```

### Multiple Scanner Buttons

Use different buttons for different fields:

```php
public static function form(Form $form): Form
{
    return $form
        ->schema([
            TextInput::make('product_barcode')
                ->label('Product Barcode')
                ->suffixAction(
                    BarcodeScannerButton::make('scanProduct')
                        ->targetField('product_barcode')
                        ->label('Scan Product')
                ),

            TextInput::make('serial_number')
                ->label('Serial Number')
                ->suffixAction(
                    BarcodeScannerButton::make('scanSerial')
                        ->targetField('serial_number')
                        ->label('Scan Serial')
                        ->icon('heroicon-o-hashtag')
                ),
        ]);
}
```

### Standalone Button

Place button outside of field suffix:

```php
Grid::make(2)
    ->schema([
        TextInput::make('barcode')
            ->label('Barcode')
            ->columnSpan(1),

        BarcodeScannerButton::make()
            ->targetField('barcode')
            ->label('Open Scanner')
            ->columnSpan(1),
    ])
```

### Dynamic Field Updates

Trigger actions after scanning:

```php
use Filament\Forms\Set;

Grid::make()
    ->schema([
        TextInput::make('barcode')
            ->live()
            ->afterStateUpdated(function (Set $set, $state) {
                // Lookup product by barcode
                $product = Product::where('barcode', $state)->first();
                if ($product) {
                    $set('name', $product->name);
                    $set('price', $product->price);
                }
            }),

        BarcodeScannerButton::make()
            ->targetField('barcode'),

        TextInput::make('name'),
        TextInput::make('price'),
    ])
```

### Custom Scanner Configuration

Configure for specific barcode types (e.g., UPC/EAN):

```php
BarcodeScannerButton::make()
    ->targetField('upc_code')
    ->scannerConfig([
        'fps' => 10,
        'qrbox' => ['width' => 400, 'height' => 150], // Wide for UPC/EAN
        'aspectRatio' => 2.67, // 16:6 ratio for barcodes
        'disableFlip' => true, // Don't try mirrored scanning
    ])
```

### Listen to Scan Events

React to barcode scans with custom JavaScript:

```blade
<div
    x-data="{}"
    @barcode-scanned.window="
        console.log('Barcode scanned:', $event.detail.value);
        // Custom logic here
    "
>
    <!-- Your form -->
</div>
```

Or in Livewire component:

```php
use Livewire\Attributes\On;

#[On('barcode-scanned')]
public function handleBarcodeScanned($data)
{
    // Custom logic
    $this->logBarcodeActivity($data['value']);
}
```

## Configuration Options

### Component Methods

| Method | Description | Default |
|--------|-------------|---------|
| `targetField(string)` | Field name to update with scanned value | `null` |
| `label(string)` | Button label text | `'Scan Barcode'` |
| `icon(string)` | Button icon (Heroicon) | `'heroicon-o-camera'` |
| `color(string)` | Button color | `'primary'` |
| `autoStop(bool)` | Stop scanning after first successful scan | `true` |
| `scannerConfig(array)` | Scanner configuration options | See below |

### Scanner Config Options

| Option | Description | Default |
|--------|-------------|---------|
| `fps` | Frames per second for scanning | `10` |
| `qrbox` | Scan region dimensions `['width' => x, 'height' => y]` | `250x250` |
| `aspectRatio` | Camera aspect ratio | `1.0` |
| `disableFlip` | Disable mirrored scanning | `false` |

## Server Setup

### Ubuntu/Nginx Configuration

**HTTPS is required** for camera access. Configure SSL certificate:

```bash
# Using Let's Encrypt with Certbot
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Nginx configuration example:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    root /var/www/your-app/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## Browser Compatibility

**Supported:**
- Chrome 90+ (Desktop & Mobile)
- Firefox 88+ (Desktop & Mobile)
- Safari 14+ (Desktop & iOS)
- Edge 90+

**Requirements:**
- HTTPS (mandatory except localhost)
- Camera permissions granted
- JavaScript enabled

## Troubleshooting

### Camera Not Working

**Problem:** "Camera not found" or permission errors

**Solutions:**
1. Ensure site is served over HTTPS
2. Check browser permissions: `chrome://settings/content/camera`
3. Verify camera is not used by another application
4. Test with official demo: https://scanapp.org/html5-qrcode-docs

### Assets Not Loading

**Problem:** JavaScript not loading or 404 errors

**Solutions:**
```bash
# Republish assets
php artisan filament:assets

# Clear all caches
php artisan optimize:clear

# Check public directory
ls -la public/vendor/filament/

# Ensure proper permissions
sudo chown -R www-data:www-data public/
```

### Field Not Updating

**Problem:** Scan succeeds but field value doesn't change

**Solutions:**
1. Verify target field name matches exactly (case-sensitive)
2. Check browser console for JavaScript errors
3. Ensure field is not disabled or readonly
4. Test with `.live()` modifier on target field

## Best Practices

### Performance Optimization

1. **Lower FPS on Mobile**: Better performance with lower frame rates
2. **Smaller Scan Region**: Faster processing

```php
->scannerConfig([
    'fps' => 8,  // Lower for mobile
    'qrbox' => ['width' => 200, 'height' => 200],
])
```

### Security Considerations

1. **Always use HTTPS** in production
2. **Validate scanned data** server-side
3. **Consider rate limiting** on barcode lookup endpoints

```php
TextInput::make('barcode')
    ->rules(['required', 'regex:/^[0-9]{13}$/']) // EAN-13 validation
    ->afterStateUpdated(function ($state) {
        // Server-side validation and lookup
    })
```

### User Experience

1. **Provide manual input fallback** - always allow typing
2. **Show visual feedback** - loading states and success messages
3. **Test on mobile first** - primary use case for barcode scanning

## Development

### Building Assets

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Watch and rebuild on changes
npm run dev
```

### Code Formatting

```bash
composer format
```

## License

MIT License

## Credits

- Built with [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- Designed for [Filament](https://filamentphp.com/)

## Support

For issues and questions, please use the GitHub issue tracker.
