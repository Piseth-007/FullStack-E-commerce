<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <title>Weyoung | Login</title>
</head>

<body class="w-screen h-screen flex justify-between items-center">
    <div class="relative h-full w-1/2 flex flex-col items-center justify-center gap-2.5">
        <img class="absolute z-0 h-full w-full object-cover rounded-r-[80px]" src="{{ asset('storage/auth/auth_banner.jpg') }}">
        <div class="absolute w-4/5 top-20 z-10 flex flex-col justify-center gap-2 px-5">
            <h1 class="uppercase text-5xl tracking-tighter font-semibold text-white text-balance">Welcome back</h1>
            <p class="text-base text-white">Did you have a good experience with our store?</p>
        </div>
        <a class="absolute z-20 top-3 left-3 h-10 px-5 flex justify-center items-center gap-1.5 bg-white/80 rounded-full text-black" href="{{ route('index') }}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-left-icon lucide-arrow-left text-black">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
            </svg>
            Home
        </a>
    </div>
    <div class=" h-full w-1/2 flex flex-col justify-center gap-2.5 px-12">
        <form class="w-full flex flex-col gap-2.5" action="#" method="post">
            <div class="w-full flex flex-col justify-center gap-1.5">
                <label class="cursor-pointer text-sm text-black" for="email">Email <span class="text-red-500">*</span></label>
                <input class="h-12 px-4 bg-[var(--gray)] rounded-full text-sm border border-transparent outline-0 transition duration-200 hover:border-black focus:border-black" type="email" id="email" name="email" placeholder="pisal@gmail.com">
            </div>
            <div class="w-full flex flex-col justify-center gap-1.5">
                <label class="cursor-pointer text-sm text-black" for="password">Password <span class="text-red-500">*</span></label>
                <input class="h-12 px-4 bg-[var(--gray)] rounded-full text-sm border border-transparent outline-0 transition duration-200 hover:border-black focus:border-black" type="password" id="password" name="password" placeholder="Create password">
            </div>
            <div class="w-full flex flex-col justify-center gap-1.5 mt-5">
                <button class="w-full h-12 bg-black text-white text-sm rounded-full flex justify-center items-center gap-1" type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user-icon lucide-user">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Create account
                </button>
            </div>
            <div class="w-full flex justify-center items-center">
                <p class="text-sm text-black">Don't have an account ? <a class=" font-semibold" href="{{ route('register') }}">Register</a></p>
            </div>
        </form>
    </div>
</body>

</html>