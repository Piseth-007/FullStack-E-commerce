<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <title>Document</title>
</head>

<body class="w-screen overflow-x-hidden">
    <nav class="fixed top-0 inset-x-0 h-12 flex justify-between items-center px-5 bg-white">
        <h1 class="absolute left-1/2 -translate-x-1/2 text-4xl font-semibold text-black uppercase tracking-tighter">Weyoung</h1>
        <ul class="flex items-center gap-7">
            <li><a class="text-sm text-gray-700 transition duration-200 hover:text-black" href="#">Home</a></li>
            <li><a class="text-sm text-gray-700 transition duration-200 hover:text-black" href="#">Shop</a></li>
            <li><a class="text-sm text-gray-700 transition duration-200 hover:text-black" href="#">Category</a></li>
            <li><a class="text-sm text-gray-700 transition duration-200 hover:text-black" href="#">Free Delivery</a></li>
        </ul>
        <ul class="flex items-center gap-7">
            <li><a class="h-5 w-5 flex justify-center items-center" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-handbag-icon lucide-handbag">
                        <path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z" />
                        <path d="M8 11V6a4 4 0 0 1 8 0v5" />
                    </svg>
                </a></li>
            <li><a class="h-5 w-5 flex justify-center items-center" href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-icon lucide-heart">
                        <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                    </svg>
                </a></li>
            <li><a class="h-5 w-5 flex justify-center items-center" href="{{ route('login') }}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user w-full h-full
             object-contain">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </a></li>
        </ul>
    </nav>
    <section class="w-screen h-[520px] flex justify-center items-center overflow-hidden mt-12">
        <img class="w-full h-full object-cover" src="{{ asset('storage/banner/weyoungbanner.jpg') }}">
    </section>
    <section class="h-[calc(650px-520px)] w-screen flex items-center"></section>
    <!-- new arrivals -->
    <section class="w-screnn flex flex-col items-center">
        <div class="w-full flex justify-between items-center px-2.5">
            <h1 class="text-3xl font-semibold text-black">😍 New Arrivals 🎉</h1>
            <a class="text-base font-medium underline" href="#">See more</a>
        </div>
    </section>
</body>

</html>