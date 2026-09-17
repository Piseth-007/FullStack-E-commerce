<?php

namespace App\Mail;

use App\Models\Product;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewProductAlert extends Mailable
{
    use Queueable, SerializesModels;

    public Product $product;
    public string $productUrl;
    public ?string $imageUrl;
    public string $finalPrice;
    public ?string $originalPrice;
    public ?int $discountPercent;

    /**
     * Create a new message instance.
     */
    public function __construct(Product $product)
    {
        $this->product = $product;

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $this->productUrl = rtrim($frontendUrl, '/') . '/products/' . $product->id;

        // Determine primary image
        $image = null;
        if (!empty($product->images) && is_array($product->images)) {
            $primary = collect($product->images)->firstWhere('is_primary', true);
            $image = $primary['url'] ?? ($product->images[0]['url'] ?? null);
            if (!$image && isset($product->images[0]) && is_string($product->images[0])) {
                $image = $product->images[0];
            }
        }
        $this->imageUrl = $image;

        $price = (float) $product->price;
        $discount = (float) ($product->discount ?? 0);

        if ($discount > 0) {
            $this->discountPercent = (int) round($discount);
            $discountedPrice = max(0, $price - ($price * $discount / 100));
            $this->finalPrice = number_format($discountedPrice, 2);
            $this->originalPrice = number_format($price, 2);
        } else {
            $this->discountPercent = null;
            $this->finalPrice = number_format($price, 2);
            $this->originalPrice = null;
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "🌿 New Arrival: {$this->product->name} is now available at Botaniq",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.new-product-alert',
            with: [
                'product' => $this->product,
                'productUrl' => $this->productUrl,
                'imageUrl' => $this->imageUrl,
                'finalPrice' => $this->finalPrice,
                'originalPrice' => $this->originalPrice,
                'discountPercent' => $this->discountPercent,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
