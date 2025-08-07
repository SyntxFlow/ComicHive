<script lang="ts">
	import type { IAnimeSlug } from './+page';
	import { onMount, onDestroy } from 'svelte';
	import { scale } from 'svelte/transition';
	import { ArrowLeft, Star, Eye, SlidersHorizontal } from '@lucide/svelte';

	import { AnimeMobileClient } from '$lib/api/clients/mobile/animeClient';
	import type { IAnimeDetail } from '$lib/api/types/mobile/detailType';
	import { runtimeMobile } from '$lib/stores/runtime';

	import LoadingElements from '$lib/components/ui/LoadingElements.svelte';

	export let data: IAnimeSlug;

	let imgEl: HTMLImageElement;
	let bgHeight = 0;

	let animeDetail: IAnimeDetail;
	let isLoading = true;

	const handleResize = () => {
		bgHeight = imgEl.clientHeight;
	};

	onMount(async () => {
		isLoading = true;
		if (
			$runtimeMobile['anime.detail.' + data.animeSlug] &&
			typeof $runtimeMobile['anime.detail.' + data.animeSlug] == 'object'
		) {
			animeDetail = $runtimeMobile['anime.detail.' + data.animeSlug];
		} else {
			const response = await AnimeMobileClient.getDetail(data.animeSlug);
			animeDetail = response;
			$runtimeMobile['anime.detail.' + data.animeSlug] = response;
		}
		isLoading = false;

		setTimeout(() => {
			if (imgEl.complete) {
				bgHeight = imgEl.clientHeight;
			} else {
				imgEl.addEventListener('load', () => {
					bgHeight = imgEl.clientHeight;
				});
			}

			window.addEventListener('resize', handleResize);
		}, 10);
	});

	onDestroy(() => {
		window.removeEventListener('resize', handleResize);
	});
</script>

<svelte:head>
  <title>{animeDetail?.title} - Finime</title>
  <meta
    name="description"
    content={animeDetail?.description || 'Jelajahi koleksi anime terlengkap di Finime. Streaming anime sub Indo gratis, update episode terbaru setiap hari, kualitas HD, tanpa iklan judi, dan komunitas anime aktif. Temukan anime favoritmu sekarang!'}
  />
  <meta
    name="keywords"
    content={animeDetail?.genres.join(', ') || 'anime, streaming, sub indo, gratis, terbaru, HD, komunitas'}
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
    content={animeDetail?.title || 'Finime - Jelajahi Koleksi Anime Terlengkap'}
  />
  <meta
    property="og:description"
    content={animeDetail?.description || 'Jelajahi koleksi anime terlengkap di Finime. Streaming anime sub Indo gratis, update episode terbaru setiap hari, kualitas HD, tanpa iklan judi, dan komunitas anime aktif. Temukan anime favoritmu sekarang!'}
  />
  <meta property="og:image" content={animeDetail?.image} />
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
    content={animeDetail?.title || 'Finime - Jelajahi Koleksi Anime Terlengkap'}
  />
  <meta
    name="twitter:description"
    content={animeDetail?.description || 'Jelajahi koleksi anime terlengkap di Finime. Streaming anime sub Indo gratis, update episode terbaru setiap hari, kualitas HD, tanpa iklan judi, dan komunitas anime aktif. Temukan anime favoritmu sekarang!'}
  />
  <meta
    name="twitter:image"
    content={animeDetail?.image}
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
          "url": {animeDetail?.image}
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
{:else}
	<div class="relative block overflow-x-hidden" in:scale={{ duration: 200, start: 0.95 }}>
		<div class="fixed top-0 -z-[5] flex h-auto w-screen bg-green-500">
			<span
				style="height: {bgHeight + 20}px"
				class="absolute top-0 z-[5] flex w-screen bg-gradient-to-b from-black/30 to-black/95 transition-all duration-200"
			></span>
			<img
				bind:this={imgEl}
				class="h-full w-screen object-contain blur-[2px]"
				src={animeDetail?.image}
				alt={animeDetail?.title}
			/>
		</div>

		<div class="mx-auto max-w-md px-4 pb-20 pt-3">
			<!-- Top bar -->
			<div class="mb-4 flex items-center justify-between">
				<button
					aria-label="Back"
					class="text-2xl text-white"
					on:click={() => window.history.back()}
				>
					<ArrowLeft size={24} />
				</button>
				<button class="rounded-full bg-white px-5 py-1.5 text-sm font-medium text-black">
					My Kisah
				</button>
			</div>

			<!-- Poster -->
			<div class="mb-4 mt-10 flex justify-center">
				<img
					alt="Anime poster showing five characters around a table with various dishes, one standing behind, colorful anime style"
					class="h-[380px] w-[270px] rounded-xl object-cover shadow-lg"
					src={animeDetail?.image}
				/>
			</div>

			<!-- Title and info -->
			<h1 class="mb-1 text-center text-xl font-semibold text-white">
				{animeDetail?.title}
			</h1>
			{#each animeDetail?.altTitles as title}
				<p class="mb-1 text-center text-sm text-gray-300">{title}</p>
			{/each}
			<p class="mb-1 text-center text-sm text-gray-300">
				{animeDetail?.type} | {animeDetail?.status} | {animeDetail?.airing?.from}
			</p>
			<p
				class="mb-3 flex items-center justify-center space-x-1 text-center font-semibold text-yellow-400"
			>
				<Star size={18} fill="yellow" />
				<span> 7.19 </span>
			</p>
			<!-- Tags -->
			<div class="mb-4 flex flex-wrap justify-center gap-2">
				{#each animeDetail?.genres as genre}
					<span
						class="rounded-full border-2 border-red-500 px-3 py-1 text-xs font-medium text-white"
					>
						{genre.replace(',', '')}
					</span>
				{/each}
			</div>
			<div class="mb-4 flex flex-wrap justify-center gap-2">
				{#each animeDetail?.relatedTags as tag}
					<span class="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white">
						{tag.replace(',', '')}
					</span>
				{/each}
			</div>

			<!-- Description -->
			<div
				class="no-scroll max-h-50 relative mb-3 min-h-0 overflow-y-hidden text-center text-sm leading-relaxed text-gray-300"
			>
				<span
					class="pointer-events-none absolute inset-0 block h-full w-full bg-gradient-to-b from-black/20 via-transparent to-black/20"
				></span>
				<p class="max-h-50 no-scroll h-full w-full overflow-y-auto">{animeDetail?.description}</p>
			</div>

			<!-- Episode header -->
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold text-white">
					Episode ({animeDetail?.episodeList.length})
				</h2>
				<button aria-label="Sort episodes" class="rounded-lg bg-[#2e2a3d] p-3 text-white">
					<SlidersHorizontal size={20} />
				</button>
			</div>

			<!-- Episodes list -->
			<div class="flex flex-col gap-1.5">
				{#each animeDetail?.episodeList as episode}
					<a href="/mobile/anime/watch/{data.animeSlug}/{episode.ep}">
						<div
							class="flex items-center justify-between rounded-xl bg-[#2e2a3d] p-4 text-gray-300"
						>
							<div>
								<h3 class="mb-1 text-lg font-normal text-white">Episode {episode.ep}</h3>
								<!-- <p class="text-xs text-gray-400">27 Juli, 2025</p> -->
							</div>
							<div class="flex items-center space-x-1 text-sm text-gray-400">
								<Eye size={16} />
								<!-- <span> 4866 </span> -->
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
{/if}
