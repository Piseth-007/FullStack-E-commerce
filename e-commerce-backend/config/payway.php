<?php

return [

    'environment' => env('ABA_PAYWAY_ENV', 'sandbox'),

    'merchant_id' => env('ABA_PAYWAY_MERCHANT_ID'),

    // This is ABA's "Public Key" value, NOT the RSA public key.
    'api_key' => env('ABA_PAYWAY_API_KEY'),

    'sandbox_url' =>
    'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase',

    'production_url' =>
    'https://checkout.payway.com.kh/api/payment-gateway/v1/payments/purchase',

];
