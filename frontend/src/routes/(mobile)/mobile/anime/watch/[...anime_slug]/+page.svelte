<script lang="ts">
	import type { IAnimeSlug } from './+page';
	import { onMount, onDestroy } from 'svelte';
	import { Star, Shield, VerifiedIcon, SendHorizonal, EllipsisVertical, Loader } from '@lucide/svelte';
	import { scale, fade } from 'svelte/transition';
	import { page } from '$app/state';
	import { page as pages } from '$app/stores';
	import Plyr from "plyr";
	import 'plyr/dist/plyr.css';
	import { PUBLIC_API } from '$env/static/public';

	import { AnimeMobileClient } from '$lib/api/clients/mobile/animeClient';
	import { UserMobileClient } from '$lib/api/clients/mobile/userClient';
	import type { IAnimeEpisodeDetail } from '$lib/api/types/mobile/episodeType';
	import type { IAnimeDetail } from '$lib/api/types/mobile/detailType';
	import type { ICommentModel } from '$lib/api/types/mobile/commentType';
	import { runtimeMobile } from '$lib/stores/runtime';
	import { getInitials } from '$lib';

	import LoadingElements from '$lib/components/ui/LoadingElements.svelte';
	import { goto } from '$app/navigation';

	export let data: IAnimeSlug;

	const QUALITY = {
		"360": 0,
		"480": 1,
		"720": 2
	}
	const animeSlug = page.url.pathname.split('/').slice(-3, -1).join('/');
	const user = page.data.user;

	$: animeSlugWithEpisode = "";

	$: {
		if ($pages.url.pathname.split('/').slice(-3).length > 2) {
			animeSlugWithEpisode = $pages.url.pathname.split('/').slice(-3).join('/');
		} else {
			animeSlugWithEpisode = data.animeSlug;
		}
	}

	let animeDetail: IAnimeEpisodeDetail;
	let animeDetail2: IAnimeDetail;
	let commentList: ICommentModel[] = [];
	let isLoading = true;
	let player: Plyr;
	let lastSlug = data.animeSlug;
	let isOpenDots = false;
	let isCommentLoading = false;
	let commentStr = ""

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

	async function postComment(comment: string) {
		if (!user || !user.id) {
			return;
		}

		try {
			const response = await UserMobileClient.postComment(comment, animeSlugWithEpisode);
		} catch (error) {
			console.error('Error posting comment:', error);
		}
	}

	async function fetchComment() {
		const response = await UserMobileClient.getComment(animeSlugWithEpisode);
		commentList = response;
		$runtimeMobile["comment.detail." + data.animeSlug] = response;
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
		
		// if ($runtimeMobile["comment.detail." + data.animeSlug] && typeof $runtimeMobile["comment.detail." + data.animeSlug] == "object") {
		// 	commentList = $runtimeMobile["comment.detail." + data.animeSlug]
		// } else {
		// 	await fetchComment();
		// }
		await fetchComment();

		isLoading = false;
	}

	function handleCloseDots(event: MouseEvent) {
		if (!event.target || !(event.target as HTMLElement).closest('.dots-menu')) {
			isOpenDots = false;
		}
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

			if (typeof window !== "undefined") {
				window.addEventListener("click", handleCloseDots);
			}

		}, 10)

	});

	onDestroy(() => {
		if (player && typeof window !== "undefined") {
			player.off('enterfullscreen', lockLandscape);
			player.off('exitfullscreen', unlockOrientation);

			window.removeEventListener("click", handleCloseDots);

			player.destroy();
		}
		unlockOrientation();
  });
</script>

<svelte:head>
  <title>Finime - Nonton Anime & Baca Manga Gratis Tanpa Iklan Judi Online</title>
  <meta
    name="description"
    content="Finime adalah situs nonton anime dan baca manga sub Indo gratis tanpa iklan, terutama tanpa iklan judi online. Streaming anime terbaru, koleksi manga terlengkap, update episode & chapter setiap hari, kualitas HD, dan komunitas aktif. Nikmati pengalaman menonton dan membaca tanpa gangguan iklan!"
  />
  <meta
    name="keywords"
    content="nonton anime gratis, baca manga gratis, streaming anime sub indo, download anime, anime tanpa iklan, manga tanpa iklan, anime sub indo, manga sub indo, anime terbaru, manga terbaru, anime update, manga update, anime HD, anime no ads, manga no ads, anime anti judi, situs anime terbaik, situs manga terbaik, finime, anime indonesia, manga indonesia, anime legal, baca komik, baca komik gratis, streaming anime indonesia, anime subtitle indonesia, anime tanpa iklan judi, manga tanpa iklan judi"
  />
  <meta name="author" content="Finime Team" />
  <link rel="canonical" href="https://www.finime.my.id/" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.finime.my.id/" />
  <meta
    property="og:title"
    content="Finime - Nonton Anime & Baca Manga Gratis Tanpa Iklan Judi Online"
  />
  <meta
    property="og:description"
    content="Finime adalah website streaming anime dan baca manga sub Indo gratis tanpa iklan, terutama tanpa iklan judi online. Koleksi anime & manga terlengkap, update setiap hari, kualitas HD, dan tanpa gangguan iklan. Nikmati pengalaman terbaik di Finime!"
  />
  <meta property="og:image" content="https://www.finime.my.id/web-app-manifest-512x512.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:locale" content="id_ID" />
  <meta property="og:site_name" content="Finime" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@finime_id" />
  <meta name="twitter:creator" content="@finime_id" />
  <meta name="twitter:url" content="https://www.finime.my.id/" />
  <meta
    name="twitter:title"
    content="Finime - Nonton Anime & Baca Manga Gratis Tanpa Iklan Judi Online"
  />
  <meta
    name="twitter:description"
    content="Finime adalah situs streaming anime dan baca manga gratis tanpa iklan, terutama tanpa iklan judi online. Update anime & manga terbaru setiap hari, kualitas HD, dan komunitas aktif. Nikmati pengalaman tanpa gangguan iklan di Finime!"
  />
  <meta
    name="twitter:image"
    content="https://www.finime.my.id/web-app-manifest-512x512.png"
  />

  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Finime",
      "url": "https://www.finime.my.id/",
      "description": "Finime adalah website nonton anime dan baca manga sub Indo gratis tanpa iklan, terutama tanpa iklan judi online. Streaming anime & manga terlengkap, update setiap hari, kualitas HD, dan komunitas aktif.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.finime.my.id/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
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

  <link
    rel="apple-touch-icon"
    sizes="180x180"
    href="/apple-touch-icon.png"
  />
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
  <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
  <meta name="msapplication-TileColor" content="#da532c" />
  <meta name="theme-color" content="#111827" />
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
		<p class="mb-4 mt-1 text-base font-normal">Episode {parseInt((animeDetail?.title || "-").match(/\(\w+\s?([0-9]+)\)/i)?.[1] || "1") || "1"}</p>
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
			{#each animeDetail2?.episodeList || [] as episode, i (i)}
				<button
					on:click={() => {
						goto(`/mobile/anime/watch/${animeSlug}/${i+1}`, { replaceState: true });
					}}
					class="flex {parseInt(i+1) == parseInt((animeDetail?.title || "-").match(/\(\w+\s?([0-9]+)\)/i)?.[1] || "1") ? "bg-red-500" : "bg-[#3a3a4a]"} cursor-pointer items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
				>
					Eps {i+1}
				</button>
			{/each}
		</div>
		<h2 class="mb-4 text-xl font-extrabold">Komentar</h2>
		{#if Object.keys(user).length > 0}
			<form class="mb-6 flex gap-3">
				<input
					class="flex-grow rounded-lg bg-[#1f1f2e] px-4 py-3 text-gray-500 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6b6bf5]"
					placeholder="Komentar.."
					type="text"
					bind:value={commentStr}
				/>
				<button
					aria-label="Send comment"
					class="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1f1f2e] text-white"
					type="submit"
					disabled={isCommentLoading}
					on:click={async (e) => {
						e.preventDefault();
						const comment = commentStr
						if (!comment) return;

						isCommentLoading = true;
						try {
							await postComment(comment);
							commentStr = '';
							await fetchComment();
						} catch (error) {
							console.error('Error posting comment:', error);
						} finally {
							isCommentLoading = false;
						}
					}}
				>
					{#if isCommentLoading}
						<Loader color="red" class="animate-spin" />
					{:else}
						<SendHorizonal color="red" />
					{/if}
				</button>
			</form>
		{:else}
			<a href="/auth/login?from={btoa("/mobile/anime/watch/" + animeSlugWithEpisode)}" class="my-4 text-title-medium text-blue-500">Masuk untuk berkomentar</a>
		{/if}
		<div class="space-y-6">
			{#each commentList as comment}
				<div
					aria-label="Comment by {comment.user.name}"
					class="flex max-w-full flex-col gap-2 rounded-xl bg-[#1f1f2e] p-5"
				>
					<div class="flex items-center gap-4">
						<div class="relative">
							{#if comment.user.avatar}
								<img
									alt="Avatar of {comment.user.name}"
									class="h-12 w-12 rounded-full object-cover"
									height="48"
									src="{PUBLIC_API}/api/v1/proxy-media?mediaUrl={comment.user.avatar}"
									width="48"
								/>
							{:else}
								<div
									class="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[hsl(var(--primary))] text-lg font-bold text-white"
								>
									{getInitials(comment.user.name)}
								</div>
							{/if}
						</div>
						<div>
							<div class="flex items-center gap-2">
								<p class="font-semibold text-white">{comment.user.name}</p>
								<!-- {#if comment.user.role == "ADMIN"}
									<p class="font-semibold text-red-500">( Admin )</p>
								{/if} -->
								{#if comment.user.isVerify}
									<span
										class="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold"
										title="Verified"
									>
										<VerifiedIcon color="yellow" />
									</span>
									<Star size={20} />
									<Shield size={20} />
								{/if}
							</div>
							<div class="flex items-center gap-2">
								<span
									class="rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 px-2 py-0.5 text-xs font-semibold"
								>
									{comment.user.role}
								</span>
								<p class="text-sm text-gray-400">@{comment.user.username}</p>
							</div>
						</div>
						{#if Object.keys(user).length > 0 && user.id == comment.user.id}
							<div class="ml-auto dots-menu flex items-center relative gap-2">
								<button on:click={() => {
									isOpenDots = !isOpenDots;
								}} class="rounded-full bg-[#1f1f2e] p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
									<EllipsisVertical class="h-5 w-5 text-gray-400" />
								</button>
								{#if isOpenDots}
									<div class="absolute right-0 top-10 z-10 w-48 rounded-lg bg-black border border-white/20 p-2 shadow-lg" transition:fade={{ duration: 100 }}>
										<ul class="space-y-1">
											<li class="px-4 py-2 hover:bg-gray-500 text-red-500 cursor-pointer"><button on:click={async () => {
												await UserMobileClient.deleteComment(comment.id);
												await fetchComment();
											}}>Hapus</button></li>
										</ul>
									</div>
								{/if}
							</div>
						{/if}
						<!-- <p class="ml-auto text-xs font-semibold text-gray-400">Lv. 9999999</p> -->
					</div>
					<p class="font-normal text-title-small leading-snug text-white">
						{comment.content}
					</p>
					<div class="flex justify-between text-xs font-normal text-gray-400">
						<span> {(new Date(comment.created_at)).toLocaleDateString()} </span>
						<!-- <button class="font-bold text-white"> Balas (0) </button> -->
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
