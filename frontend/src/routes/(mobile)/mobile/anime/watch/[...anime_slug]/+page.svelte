<script lang="ts">
	import type { IAnimeSlug } from './+page';
	import { onMount, onDestroy } from 'svelte';
	import { Star, Shield, VerifiedIcon, SendHorizonal } from '@lucide/svelte';
	import { scale } from 'svelte/transition';
	import { page } from '$app/state';
	import { page as pages } from '$app/stores';
	import Plyr from "plyr";
	import 'plyr/dist/plyr.css';

	import { AnimeMobileClient } from '$lib/api/clients/mobile/animeClient';
	import type { IAnimeEpisodeDetail } from '$lib/api/types/mobile/episodeType';
	import type { IAnimeDetail } from '$lib/api/types/mobile/detailType';
	import { runtimeMobile } from '$lib/stores/runtime';

	import LoadingElements from '$lib/components/ui/LoadingElements.svelte';
	import { goto } from '$app/navigation';

	export let data: IAnimeSlug;

	const QUALITY = {
		"360": 0,
		"480": 1,
		"720": 2
	}
	const animeSlug = page.url.pathname.split('/').slice(-3, -1).join('/');
	$: animeSlugWithEpisode = $pages.url.pathname.split('/').slice(-3).join('/');

	let animeDetail: IAnimeEpisodeDetail;
	let animeDetail2: IAnimeDetail;
	let isLoading = true;
	let player: Plyr;
	let lastSlug = data.animeSlug;

    $: if (animeSlugWithEpisode && animeSlugWithEpisode !== lastSlug) {
        lastSlug = animeSlugWithEpisode;
        fetchAllData();
    }

	let playerElement: HTMLElement;

	function lockLandscape() {
		if (screen.orientation && (screen.orientation as any).lock) {
			(screen.orientation as any).lock('landscape-primary').catch(() => {});
		}
	}

	function unlockOrientation() {
		if (screen.orientation && screen.orientation.unlock) {
			screen.orientation.unlock();
		}
	}

	async function fetchAllData() {
		isLoading = true;
		if ($runtimeMobile["episode.detail." + data.animeSlug] && typeof $runtimeMobile["episode.detail." + data.animeSlug] == "object") {
			animeDetail = $runtimeMobile["episode.detail." + data.animeSlug]
		} else {
			const response = await AnimeMobileClient.getEpisode(data.animeSlug);
			animeDetail = response;
			$runtimeMobile["episode.detail." + data.animeSlug] = response;
		}
		
		if ($runtimeMobile["anime.detail." + data.animeSlug] && typeof $runtimeMobile["anime.detail." + data.animeSlug] == "object") {
			animeDetail2 = $runtimeMobile["anime.detail." + data.animeSlug]
		} else {
			const response = await AnimeMobileClient.getDetail(animeSlug);
			animeDetail2 = response;
			$runtimeMobile["anime.detail." + data.animeSlug] = response;
		}

		// console.log(animeDetail2);
		// console.log(animeDetail);
		// console.log(animeSlug)

		isLoading = false;
	}

	onMount(async () => {
		await fetchAllData();

		setTimeout(() => {
			// console.log(animeDetail?.videoUrls[animeDetail?.videoUrls?.length - 1]);

			player = new Plyr(playerElement, { controls: [
					'play-large', // The large play button in the center
					'rewind', // Rewind by the seek time (default 10 seconds)
					'play', // Play/pause playback
					'fast-forward', // Fast forward by the seek time (default 10 seconds)
					'progress', // The progress bar and scrubber for playback and buffering
					'current-time', // The current time of playback
					'duration', // The full duration of the media
					'mute', // Toggle mute
					'settings', // Settings menu
					'airplay', // Airplay (currently Safari only)
					'fullscreen', // Toggle fullscreen
				],
				autoplay: true,
				quality: {
					default: 360,
					options: [360, 480, 720],
					forced: true,
					onChange(quality) {
						// console.log('Quality changed to:', quality);
						// console.log(animeDetail?.videoUrls.length - ((QUALITY as any)[quality]))
						const currentTime = (playerElement as HTMLVideoElement).currentTime;
						const isPaused = (playerElement as HTMLVideoElement).paused;

						(playerElement as HTMLVideoElement).src = animeDetail?.videoUrls[(animeDetail?.videoUrls.length - 1) - ((QUALITY as any)[quality])];

						(playerElement as HTMLVideoElement).load();
						(playerElement as HTMLVideoElement).currentTime = currentTime;
						if (!isPaused) {
							(playerElement as HTMLVideoElement).play();
						}
					},
				},
			});

			player.on('enterfullscreen', lockLandscape);

			player.on('exitfullscreen', unlockOrientation);

		}, 10)

	});

	onDestroy(() => {
		if (player) {
			player.off('enterfullscreen', lockLandscape);
			player.off('exitfullscreen', unlockOrientation);

			player.destroy();
		}
		unlockOrientation();
  });
</script>

<svelte:head>
  <title>{animeDetail2?.title} - Finime</title>
  <meta
    name="description"
    content={animeDetail2?.description || 'Jelajahi koleksi anime terlengkap di Finime. Streaming anime sub Indo gratis, update episode terbaru setiap hari, kualitas HD, tanpa iklan judi, dan komunitas anime aktif. Temukan anime favoritmu sekarang!'}
  />
  <meta
    name="keywords"
    content={animeDetail2?.genres.join(', ') || 'anime, streaming, sub indo, gratis, terbaru, HD, komunitas'}
  />
  <meta name="author" content="Finime Team" />
  <link rel="canonical" href="https://www.finime.my.id/anime" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  
  <!-- Additional SEO Meta Tags -->
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="theme-color" content="#111827" />
  <meta name="msapplication-TileColor" content="#da532c" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Finime Anime" />

  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.finime.my.id/anime" />
  <meta
    property="og:title"
    content={animeDetail2?.title || 'Finime - Jelajahi Koleksi Anime Terlengkap'}
  />
  <meta
    property="og:description"
    content={animeDetail2?.description || 'Jelajahi koleksi anime terlengkap di Finime. Streaming anime sub Indo gratis, update episode terbaru setiap hari, kualitas HD, tanpa iklan judi, dan komunitas anime aktif. Temukan anime favoritmu sekarang!'}
  />
  <meta property="og:image" content={animeDetail2?.image} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Finime Discover Anime - Jelajahi Koleksi Anime Gratis" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="Finime" />

  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@finime_id" />
  <meta name="twitter:creator" content="@finime_id" />
  <meta name="twitter:url" content="https://www.finime.my.id/anime" />
  <meta
    name="twitter:title"
    content={animeDetail2?.title || 'Finime - Jelajahi Koleksi Anime Terlengkap'}
  />
  <meta
    name="twitter:description"
    content={animeDetail2?.description || 'Jelajahi koleksi anime terlengkap di Finime. Streaming anime sub Indo gratis, update episode terbaru setiap hari, kualitas HD, tanpa iklan judi, dan komunitas anime aktif. Temukan anime favoritmu sekarang!'}
  />
  <meta
    name="twitter:image"
    content={animeDetail2?.image}
  />
  <meta name="twitter:image:alt" content="Finime Discover Anime - Jelajahi Koleksi Anime Gratis" />

  <!-- Structured Data for Anime Collection Page -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Jelajahi Anime di Finime",
      "description": "Halaman koleksi anime terlengkap di Finime. Streaming anime sub Indo gratis, update episode terbaru, kualitas HD, tanpa iklan judi.",
      "url": "https://www.finime.my.id/anime",
      "hasPart": [
        {
          "@type": "CreativeWorkSeries",
          "name": "Anime Series",
          "url": "https://www.finime.my.id/anime"
        }
      ],
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
            "name": "Anime",
            "item": "https://www.finime.my.id/anime"
          }
        ]
      },
      "publisher": {
        "@type": "Organization",
        "name": "Finime",
        "logo": {
          "@type": "ImageObject",
          "url": {animeDetail2?.image}
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


{#if isLoading}
	<LoadingElements />
<!-- {:else} -->
{/if}
<div class="mx-auto max-w-md pb-20 text-white" in:scale={{ duration: 200, start: 0.95 }}>
	{#if Array.isArray(animeDetail?.videoUrls) && animeDetail?.videoUrls.length > 0}
		<!-- <CustomVideoPlayer videoUrl={animeDetail?.videoUrls[animeDetail?.videoUrls?.length - 1]} /> -->

		<div class="container">
			<video bind:this={playerElement} src={animeDetail?.videoUrls[animeDetail?.videoUrls?.length - 1]} controls crossorigin="anonymous" playsinline poster="/images/finime-poster.png">
				{#each animeDetail?.videoUrls as videoUrl}
					<source src={videoUrl} type="video/mp4" />
				{/each}
					
					<track kind="captions">

					<a href={animeDetail?.videoUrls[animeDetail?.videoUrls?.length - 1]} download>Download</a>
			</video>
		</div>
	{:else}
		<iframe
			class="w-full aspect-video"
			src={animeDetail?.videoUrls as string}
			frameborder="0"
			allowfullscreen
			allow="autoplay; encrypted-media; picture-in-picture"
			loading="lazy"
			title="Anime Video Player"
		></iframe>
	{/if}
	<div class="bg-gradient-to-t from-black/90 to-transparent px-5 pb-8 pt-5">
		<h1 class="text-title-medium opacity-70 font-extrabold leading-tight">{(animeDetail?.title || "").replace("- Kuramanime", "")}</h1>
		<p class="mb-4 mt-1 text-base font-normal">Episode {parseInt((animeDetail?.title || "-").match(/\(\w+\s?([0-9]+)\)/i)?.[1] || "0") || "-"}</p>
		<!-- <div class="mb-3 flex flex-wrap gap-2">
			<button
				class="flex items-center gap-2 rounded-md bg-[#3a3a4a] px-3 py-2 text-sm font-semibold"
			>
				<i class="fas fa-thumbs-up"> </i>
				396
			</button>
			<button
				class="flex items-center gap-2 rounded-md border-l border-gray-600 bg-[#3a3a4a] px-3 py-2 pl-3 text-sm font-semibold"
			>
				1
				<i class="fas fa-thumbs-down"> </i>
			</button>
			<button class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
				360p
			</button>
			<button class="rounded-md bg-[#3a3a4a] px-4 py-2 text-sm font-semibold"> Ganti </button>
			<button class="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
				S1
			</button>
			<button class="rounded-md bg-[#3a3a4a] px-4 py-2 text-sm font-semibold">
				Ganti Server
			</button>
		</div> -->
		<div class="mb-6 flex justify-center flex-wrap gap-3">
			<!-- <button
				class="flex items-center gap-2 rounded-md bg-[#3a3a4a] px-4 py-2 text-sm font-semibold"
			>
				<i class="fas fa-arrow-down"> </i>
				Download
			</button> -->
			{#each animeDetail2?.episodeList || [] as episode}
				<button
					on:click={() => {
						goto(`/mobile/anime/watch/${animeSlug}/${episode.ep}`, { replaceState: true });
					}}
					class="flex {parseInt(episode.ep) == parseInt((animeDetail?.title || "-").match(/\(\w+\s?([0-9]+)\)/i)?.[1] || "0") ? "bg-red-500" : "bg-[#3a3a4a]"} cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
				>
					Eps {episode.ep}
				</button>
			{/each}
		</div>
		<h2 class="mb-4 text-xl font-extrabold">Komentar</h2>
		<form class="mb-6 flex gap-3">
			<input
				class="flex-grow rounded-lg bg-[#1f1f2e] px-4 py-3 text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6b6bf5]"
				placeholder="Komentar.."
				type="text"
			/>
			<button
				aria-label="Send comment"
				class="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1f1f2e] text-white"
				type="submit"
			>
				<SendHorizonal />
			</button>
		</form>
		<div class="space-y-6">
			<div
				aria-label="Comment by Vivy Admin"
				class="flex max-w-full flex-col gap-2 rounded-xl bg-[#1f1f2e] p-5"
			>
				<div class="flex items-center gap-4">
					<div class="relative">
						<img
							alt="Avatar of Vivy (Admin) with pink and black colors and glowing effect"
							class="h-12 w-12 rounded-full object-cover"
							height="48"
							src="https://avatars.githubusercontent.com/u/205189488?s=400&u=1a27e3745fbf6fd793acdd113d84b82688913fa3&v=4"
							width="48"
						/>
					</div>
					<div>
						<div class="flex items-center gap-2">
							<p class="font-semibold text-white">Syntx (Admin)</p>
							<span
								class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
								title="Verified"
							>
								<VerifiedIcon color="yellow" />
							</span>
							<Star size={20} />
							<Shield size={20} />
						</div>
						<div class="flex items-center gap-2">
							<span
								class="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-2 py-0.5 text-xs font-semibold"
							>
								VIP III
							</span>
							<p class="text-sm text-gray-400">SSS-Rank</p>
						</div>
					</div>
					<p class="ml-auto text-xs font-semibold text-gray-400">Lv. 9999999</p>
				</div>
				<p class="font-normal text-title-small leading-snug text-white">
					Bukankah ini ...
				</p>
				<div class="flex justify-between text-xs font-normal text-gray-400">
					<span> 1 Menit yang lalu </span>
					<button class="font-bold text-white"> Balas (0) </button>
				</div>
			</div>
		</div>
	</div>
</div>
