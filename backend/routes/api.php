<?php

use App\Http\Controllers\AddressController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BrandController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProductImageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SkinTypeController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp'])->middleware('throttle:6,1');
Route::post('/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:4,1');

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');

Route::post('/auth/google', [AuthController::class, 'googleLogin'])
    ->middleware('throttle:5,1');

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])
    ->middleware('throttle:3,1');

Route::post('/reset-password', [PasswordResetController::class, 'reset']);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{category}', [CategoryController::class, 'show']);

Route::get('/locations/provinces', [LocationController::class, 'provinces']);
Route::get(
    '/locations/provinces/{province:code}/districts',
    [LocationController::class, 'districts']
);
Route::get(
    '/locations/districts/{district:code}/communes',
    [LocationController::class, 'communes']
);

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{brand}', [BrandController::class, 'show']);

Route::get('/skin-types', [SkinTypeController::class, 'index']);
Route::get('/skin-types/{skinType}', [SkinTypeController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);
Route::get('/settings/store', [SettingController::class, 'publicStore']);

Route::get(
    '/products/{product}/reviews',
    [ReviewController::class, 'index']
);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::post('/profile/image', [ProfileController::class, 'uploadProfileImage']);
    Route::put('/profile', [ProfileController::class, 'updateProfile']);
    Route::delete('/profile/image', [ProfileController::class, 'removeProfileImage']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);

    Route::apiResource('addresses', AddressController::class);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{productId}', [FavoriteController::class, 'destroy']);

    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/items', [CartController::class, 'store']);
    Route::put('/cart/items/{itemId}', [CartController::class, 'update']);
    Route::delete('/cart/items/{itemId}', [CartController::class, 'destroy']);
    Route::delete('/cart', [CartController::class, 'clear']);

    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

    Route::post(
        '/orders/{order}/payment',
        [PaymentController::class, 'generate']
    );

    Route::get(
        '/payments/{payment}/status',
        [PaymentController::class, 'checkStatus']
    );

    Route::post(
        '/payments/{payment}/cancel',
        [PaymentController::class, 'cancel']
    );

    Route::get('/reviewable-items', [ReviewController::class, 'reviewable']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    Route::post('/contacts', [ContactController::class, 'store']);
});

Route::middleware([
    'auth:sanctum',
    'admin',
])->group(function () {
    Route::get('/admin/contacts', [ContactController::class, 'index']);
    Route::get('/admin/contacts/{contact}', [ContactController::class, 'show']);
    Route::delete('/admin/contacts/{contact}', [ContactController::class, 'destroy']);

    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::post('/brands', [BrandController::class, 'store']);
    Route::put('/brands/{brand}', [BrandController::class, 'update']);
    Route::delete('/brands/{brand}', [BrandController::class, 'destroy']);
    Route::post('/brands/{brand}/logo', [BrandController::class, 'uploadLogo']);

    Route::post('/skin-types', [SkinTypeController::class, 'store']);
    Route::put('/skin-types/{skinType}', [SkinTypeController::class, 'update']);
    Route::delete('/skin-types/{skinType}', [SkinTypeController::class, 'destroy']);

    Route::get('/admin/products', [ProductController::class, 'adminIndex']);

    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);

    Route::post(
        '/products/{product}/images',
        [ProductImageController::class, 'store']
    );

    Route::delete(
        '/products/{product}/images',
        [ProductImageController::class, 'destroy']
    );

    Route::patch(
        '/products/{product}/images/primary',
        [ProductImageController::class, 'setPrimary']
    );

    Route::get(
        '/admin/dashboard/summary',
        [DashboardController::class, 'summary']
    );

    Route::get(
        '/admin/dashboard/sales-trend',
        [DashboardController::class, 'salesTrend']
    );

    Route::get(
        '/admin/orders',
        [OrderController::class, 'adminIndex']
    );

    Route::patch(
        '/admin/orders/{order}/status',
        [OrderController::class, 'updateStatus']
    );

    Route::get(
        '/admin/reviews',
        [ReviewController::class, 'adminIndex']
    );

    Route::get('/admin/settings', [SettingController::class, 'index']);
    Route::post('/admin/settings/store', [SettingController::class, 'updateStore']);
    Route::put('/admin/settings/payment', [SettingController::class, 'updatePayment']);
    Route::put('/admin/settings/notifications', [SettingController::class, 'updateNotifications']);
    Route::post('/admin/settings/notifications/test-telegram', [SettingController::class, 'testTelegram']);
    Route::get('/admin/notifications/counts', [NotificationController::class, 'counts']);
    Route::post('/admin/notifications/mark-viewed/{section}', [NotificationController::class, 'markViewed']);
});
