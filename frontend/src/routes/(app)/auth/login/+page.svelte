<script lang="ts">
  import { goto } from '$app/navigation';
  import { Bot } from '@lucide/svelte';
  import { AuthClient } from '$lib/api/clients/authClient';
  import Cookie from "js-cookie"
  import { page } from '$app/state';
  import toast from 'svelte-french-toast';
  import { toastOption } from '$lib/config/app';
  import { mode } from '$lib/stores/mode';
  
  let username = page.url.searchParams.get('payload') ? JSON.parse(atob(page.url.searchParams.get('payload') || '')).username : '';
  let password = page.url.searchParams.get('payload') ? JSON.parse(atob(page.url.searchParams.get('payload') || '')).password : '';
  let redirectTo = page.url.searchParams.get('from') ? atob(page.url.searchParams.get('from') || '') : $mode == "flat" ? "/mobile" : "/";
  let isLoading = false;
  let showPassword = false;
  
  async function handleLogin() {
    try {
      if (!username || !password) {
        toast.error("Silahkan isi semua field", toastOption);
        return;
      }
      
      isLoading = true;

      const response = await AuthClient.login({
        username: username,
        password: password
      });

      if (response.status !== 200) {
        toast.error(response.error.message, toastOption);
        return;
      }

      Cookie.set('token', response.result.token, { expires: 365 });
      toast.success("Berhasil login", toastOption);

      setTimeout(() => {
        goto(redirectTo, {
          invalidateAll: true,
        });
      }, 1000);
    } catch (error) {
      toast.error("Username atau password salah", toastOption);
    } finally {
      isLoading = false;
    }
  }

  function handleOAuthLogin(provider: string) {
    isLoading = true;
    
    setTimeout(() => {
      isLoading = false;
      toast.error(`Logging in with ${provider}`, toastOption);
      goto(redirectTo, {
        invalidateAll: true,
      });
    }, 2000);
  }
  
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
</script>

<svelte:head>
  <title>Login Finime - Masuk ke Akun Anime & Manga Gratis Tanpa Iklan | Finime</title>
  <meta
    name="description"
    content="Login ke Finime untuk akses penuh ke koleksi anime dan manga terbaru. Streaming anime sub Indo gratis, baca manga tanpa iklan judi, update episode & chapter harian, kualitas HD. Daftar gratis dan nikmati pengalaman menonton terbaik!"
  />
  <meta
    name="keywords"
    content="login finime, masuk finime, daftar finime, sign in finime, login anime, login manga, akun finime, user finime, member finime, nonton anime gratis, baca manga gratis, streaming anime sub indo, anime tanpa iklan, manga tanpa iklan, anime sub indo, manga sub indo, anime terbaru, manga terbaru, anime update, manga update, anime HD, anime no ads, manga no ads, anime anti judi, situs anime terbaik, situs manga terbaik, finime, anime indonesia, manga indonesia, anime legal, baca komik, baca komik gratis, streaming anime indonesia, anime subtitle indonesia, anime tanpa iklan judi, manga tanpa iklan judi"
  />
  <meta name="author" content="Finime Team" />
  <link rel="canonical" href="https://www.finime.my.id/auth/login" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  
  <!-- Additional SEO Meta Tags -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="theme-color" content="#111827" />
  <meta name="msapplication-TileColor" content="#da532c" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Finime Login" />

  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.finime.my.id/auth/login" />
  <meta
    property="og:title"
    content="Login Finime - Masuk ke Akun Anime & Manga Gratis Tanpa Iklan"
  />
  <meta
    property="og:description"
    content="Login ke Finime untuk akses penuh ke koleksi anime dan manga terbaru. Streaming anime sub Indo gratis, baca manga tanpa iklan judi, update episode & chapter harian, kualitas HD. Daftar gratis dan nikmati pengalaman menonton terbaik!"
  />
  <meta property="og:image" content="https://www.finime.my.id/web-app-manifest-512x512.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Finime Login - Masuk ke Akun Anime & Manga" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="Finime" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@finime_id" />
  <meta name="twitter:creator" content="@finime_id" />
  <meta name="twitter:url" content="https://www.finime.my.id/auth/login" />
  <meta
    name="twitter:title"
    content="Login Finime - Masuk ke Akun Anime & Manga Gratis Tanpa Iklan"
  />
  <meta
    name="twitter:description"
    content="Login ke Finime untuk akses penuh ke koleksi anime dan manga terbaru. Streaming anime sub Indo gratis, baca manga tanpa iklan judi, update episode & chapter harian, kualitas HD."
  />
  <meta
    name="twitter:image"
    content="https://www.finime.my.id/web-app-manifest-512x512.png"
  />
  <meta name="twitter:image:alt" content="Finime Login - Masuk ke Akun Anime & Manga" />

  <!-- Structured Data for Login Page -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Login Finime",
      "description": "Halaman login untuk masuk ke akun Finime. Akses penuh ke koleksi anime dan manga terbaru, streaming anime sub Indo gratis, baca manga tanpa iklan judi.",
      "url": "https://www.finime.my.id/auth/login",
      "mainEntity": {
        "@type": "WebApplication",
        "name": "Finime",
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "Web Browser",
        "description": "Platform streaming anime dan baca manga gratis tanpa iklan judi online",
        "url": "https://www.finime.my.id/",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "IDR",
          "description": "Gratis tanpa biaya"
        }
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.finime.my.id/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Login",
            "item": "https://www.finime.my.id/auth/login"
          }
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Finime",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.finime.my.id/web-app-manifest-512x512.png"
        }
      }
    }
  </script>

  <!-- Favicon and App Icons -->
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link
    rel="apple-touch-icon"
    sizes="180x180"
    href="/apple-touch-icon.png"
  />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
  
  <!-- Preconnect for Performance -->
  <link rel="preconnect" href="https://www.finime.my.id" />
  <link rel="dns-prefetch" href="https://www.finime.my.id" />
</svelte:head>

<div class="min-h-screen mt-15 flex items-center justify-center bg-black relative overflow-hidden p-8">
  <div class="w-full max-w-md z-10">
    <div class="bg-white/10 backdrop-blur-xl rounded-3xl p-5 border border-white/20 shadow-2xl">
      <div class="text-center mb-10">
        <div class="mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white">
            <Bot size={40} />
          </div>
          <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p class="text-white/80">Sign in to your Finime account</p>
        </div>
      </div>
      
      <div class="mb-8">
        <!-- <div class="flex flex-col gap-4 mb-6">
          <button 
            class="flex items-center justify-center gap-3 px-6 py-3.5 border border-white/20 rounded-xl bg-gray-900/80 text-white text-base font-medium cursor-pointer transition-all duration-300 backdrop-blur-lg hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            on:click={() => handleOAuthLogin('GitHub')}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
          
          <button 
            class="flex items-center justify-center gap-3 px-6 py-3.5 border border-white/20 rounded-xl bg-gray-900/80 text-white text-base font-medium cursor-pointer transition-all duration-300 backdrop-blur-lg hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            on:click={() => handleOAuthLogin('Google')}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div> -->
        
        <!-- <div class="relative text-center my-6">
          <div class="absolute top-1/2 left-0 right-0 h-px bg-white/20"></div>
          <span class="bg-white/10 backdrop-blur-lg px-4 text-white/80 text-sm relative">or</span>
        </div> -->
      </div>
      
      <form class="mb-8" on:submit|preventDefault={handleLogin}>
        <div class="mb-6">
          <label for="username" class="block text-white font-medium mb-2 text-sm">Username</label>
          <div class="relative flex items-center">
            <svg class="absolute left-4 text-white/60 z-10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              id="username"
              type="text"
              bind:value={username}
              placeholder="Enter your username or email"
              required
              disabled={isLoading}
              class="w-full px-4 py-3.5 pl-12 border border-white/20 rounded-xl bg-white/10 text-white text-base backdrop-blur-lg transition-all duration-300 placeholder:text-white/50 focus:outline-none focus:border-white/50 focus:bg-white/15 focus:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-white font-medium mb-2 text-sm">Password</label>
          <div class="relative flex items-center">
            <svg class="absolute left-4 text-white/60 z-10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              class="w-full px-4 py-3.5 pl-12 pr-12 border border-white/20 rounded-xl bg-white/10 text-white text-base backdrop-blur-lg transition-all duration-300 placeholder:text-white/50 focus:outline-none focus:border-white/50 focus:bg-white/15 focus:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <button 
              type="button" 
              class="absolute right-4 bg-transparent border-none text-white/60 cursor-pointer p-1 rounded transition-colors duration-300 hover:text-white/80 disabled:opacity-60 disabled:cursor-not-allowed"
              on:click={togglePasswordVisibility}
              disabled={isLoading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                {#if showPassword}
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                {:else}
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                {/if}
              </svg>
            </button>
          </div>
        </div>
        
        <!-- <div class="flex justify-between items-center mb-8">
          <label class="flex items-center gap-2 text-white/80 text-sm cursor-pointer">
            <input 
              type="checkbox" 
              bind:checked={rememberMe}
              disabled={isLoading}
              class="hidden"
            />
            <span class="w-4.5 h-4.5 border-2 border-white/30 rounded relative transition-all duration-300 {rememberMe ? 'bg-gradient-to-br from-red-400 to-cyan-400 border-transparent' : ''}">
              {#if rememberMe}
                <span class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">✓</span>
              {/if}
            </span>
            Remember me
          </label>
          
          <a href="/auth/forgot-password" class="text-white/80 text-sm no-underline transition-colors duration-300 hover:text-white">
            Forgot password?
          </a>
        </div> -->
        
        <button 
          type="submit" 
          class="w-full py-4 bg-gradient-to-r from-red-400 to-cyan-400 border-none rounded-xl text-white text-base font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
          disabled={isLoading}
        >
          {#if isLoading}
            <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Signing in...
          {:else}
            Sign In
          {/if}
        </button>
      </form>
      
      <div class="text-center text-white/80 text-sm">
        <p>
          Don't have an account? 
          <a href="/auth/register{page.url.searchParams.size ? "?" + page.url.searchParams.toString() : ""}" class="text-cyan-400 no-underline font-semibold transition-colors duration-300 hover:text-red-400">Sign up</a>
        </p>
      </div>
    </div>
  </div>
</div>
