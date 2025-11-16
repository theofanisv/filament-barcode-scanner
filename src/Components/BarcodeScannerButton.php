<?php

namespace Theograms\FilamentBarcodeScanner\Components;

use Closure;
use Filament\Schemas\Components\Component;
use Filament\Support\Concerns\HasExtraAlpineAttributes;

class BarcodeScannerButton extends Component
{
    use HasExtraAlpineAttributes;

    protected string $view = 'filament-barcode-scanner::components.barcode-scanner-button';

    protected string | Closure | null $targetField = null;
    protected array | Closure $scannerConfig = [];
    protected string | Closure $buttonLabel = '';
    protected string | Closure | null $buttonIcon = 'heroicon-o-camera';
    protected string | Closure | null $buttonColor = 'primary';
    protected bool | Closure $autoStop = true;

    /**
     * Set the target field name to update with scanned value
     */
    public function targetField(string | Closure | null $field): static
    {
        $this->targetField = $field;
        return $this;
    }

    public function getTargetField(): ?string
    {
        return $this->evaluate($this->targetField);
    }

    /**
     * Configure html5-qrcode scanner options
     */
    public function scannerConfig(array | Closure $config): static
    {
        $this->scannerConfig = $config;
        return $this;
    }

    public function getScannerConfig(): array
    {
        return array_merge([
            'fps' => 30,
            'qrbox' => ['width' => 350, 'height' => 350],
            'aspectRatio' => 1.0,
            'disableFlip' => false,
        ], $this->evaluate($this->scannerConfig));
    }

    /**
     * Set button label
     */
    public function label(string | Closure $label): static
    {
        $this->buttonLabel = $label;
        return $this;
    }

    public function getLabel(): string
    {
        return $this->evaluate($this->buttonLabel);
    }

    /**
     * Set button icon
     */
    public function icon(string | Closure | null $icon): static
    {
        $this->buttonIcon = $icon;
        return $this;
    }

    public function getIcon(): ?string
    {
        return $this->evaluate($this->buttonIcon);
    }

    /**
     * Set button color
     */
    public function color(string | Closure | null $color): static
    {
        $this->buttonColor = $color;
        return $this;
    }

    public function getColor(): ?string
    {
        return $this->evaluate($this->buttonColor);
    }

    /**
     * Enable/disable auto-stop after first scan
     */
    public function autoStop(bool | Closure $condition = true): static
    {
        $this->autoStop = $condition;
        return $this;
    }

    public function getAutoStop(): bool
    {
        return $this->evaluate($this->autoStop);
    }

    /**
     * Make this a standalone component (not a field)
     */
    public static function make(string $name = 'barcodeScanner'): static
    {
        return app(static::class, ['name' => $name]);
    }
}
