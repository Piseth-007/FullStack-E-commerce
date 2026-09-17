<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Arrival at Botaniq</title>
</head>

<body
    style="margin: 0; padding: 0; background-color: #F8F7F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E2320; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
        style="background-color: #F8F7F4; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
                    style="max-width: 540px; background-color: #FFFFFF; border: 1px solid #E6E4DE; border-radius: 12px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04); overflow: hidden;">

                    <!-- Brand Header -->
                    <tr>
                        <td
                            style="padding: 32px 40px 24px; text-align: center; border-bottom: 1px solid #F0EFEA; background-color: #FFFFFF;">
                            <span
                                style="font-size: 14px; letter-spacing: 3px; font-weight: 700; text-transform: uppercase; color: #3F5843; display: inline-block;">
                                🌿 BOTANIQ
                            </span>
                            <div
                                style="font-size: 11px; letter-spacing: 1.5px; color: #8A8F87; text-transform: uppercase; margin-top: 4px;">
                                Botanical Skincare & Wellness
                            </div>
                        </td>
                    </tr>

                    <!-- Hero Badge -->
                    <tr>
                        <td style="padding: 28px 40px 0; text-align: center;">
                            <div
                                style="display: inline-block; background-color: #EEF3EF; color: #3F5843; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 6px 14px; border-radius: 20px; border: 1px solid #D8E4DA;">
                                ✨ New Arrival Just Dropped
                            </div>
                            <h1
                                style="margin: 16px 0 8px; font-size: 24px; font-weight: 600; color: #1E2320; font-family: 'Georgia', serif; line-height: 1.3;">
                                {{ $product->name }}
                            </h1>
                            @if (!empty($product->brand?->name) || !empty($product->category?->name))
                                <p
                                    style="margin: 0; font-size: 13px; color: #767D74; text-transform: uppercase; letter-spacing: 1px;">
                                    {{ $product->brand?->name ?? $product->category?->name }}
                                </p>
                            @endif
                        </td>
                    </tr>

                    <!-- Product Image (if available) -->
                    @if (!empty($imageUrl))
                        <tr>
                            <td style="padding: 24px 40px 10px; text-align: center;">
                                <a href="{{ $productUrl }}" target="_blank" style="text-decoration: none;">
                                    <img src="{{ $imageUrl }}" alt="{{ $product->name }}"
                                        style="max-width: 100%; width: 380px; height: 260px; object-fit: cover; border-radius: 10px; border: 1px solid #E6E4DE; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05); display: inline-block;" />
                                </a>
                            </td>
                        </tr>
                    @endif

                    <!-- Product Details Box -->
                    <tr>
                        <td style="padding: 20px 40px 24px;">
                            <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0"
                                style="background-color: #FBFBFA; border: 1px solid #ECEAE5; border-radius: 8px; padding: 18px 20px;">
                                <tr>
                                    <td>
                                        <div
                                            style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #8A8F87; margin-bottom: 4px;">
                                            Price</div>
                                        <div
                                            style="font-size: 24px; font-weight: 700; color: #1E2320; font-family: -apple-system, BlinkMacSystemFont, monospace;">
                                            ${{ $finalPrice }}
                                            @if (!empty($originalPrice))
                                                <span
                                                    style="font-size: 15px; color: #8A8F87; text-decoration: line-through; font-weight: normal; margin-left: 6px;">${{ $originalPrice }}</span>
                                                <span
                                                    style="font-size: 11px; background-color: #C96A5B; color: #FFFFFF; font-weight: 700; padding: 3px 8px; border-radius: 12px; margin-left: 6px; vertical-align: middle;">
                                                    -{{ $discountPercent }}%
                                                </span>
                                            @endif
                                        </div>
                                    </td>
                                    @if ($product->free_delivery)
                                        <td align="right" style="vertical-align: middle;">
                                            <span
                                                style="display: inline-block; background-color: #EEF3EF; color: #3F5843; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 6px; border: 1px solid #D8E4DA;">
                                                🚚 Free Delivery
                                            </span>
                                        </td>
                                    @endif
                                </tr>

                                @if (!empty($product->description))
                                    <tr>
                                        <td colspan="2"
                                            style="padding-top: 14px; border-top: 1px solid #EFEFEA; margin-top: 12px;">
                                            <p style="margin: 0; font-size: 13.5px; line-height: 1.6; color: #5C625A;">
                                                {{ Str::limit(strip_tags($product->description), 180) }}
                                            </p>
                                        </td>
                                    </tr>
                                @endif
                            </table>
                        </td>
                    </tr>

                    <!-- Call To Action Button -->
                    <tr>
                        <td style="padding: 0 40px 32px; text-align: center;">
                            <a href="{{ $productUrl }}" target="_blank"
                                style="display: inline-block; background-color: #3F5843; color: #FFFFFF; font-size: 14.5px; font-weight: 600; text-decoration: none; padding: 14px 36px; border-radius: 8px; box-shadow: 0 3px 10px rgba(63, 88, 67, 0.2); letter-spacing: 0.3px;">
                                View Product & Shop Now →
                            </a>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td
                            style="border-top: 1px solid #F0EFEA; padding: 24px 40px; text-align: center; background-color: #FAFAF8;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: #8A8F87; line-height: 1.5;">
                                You are receiving this email because you subscribed to <strong>Botaniq New Product
                                    Alerts</strong>.
                            </p>
                            <p style="margin: 0; font-size: 11px; color: #A4AAA0;">
                                Botaniq Skincare Store &bull; Phnom Penh, Cambodia &bull; All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>
