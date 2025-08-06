<script lang="ts">
	import type { IAnimeSlug } from './+page';
	import { onMount } from 'svelte';
	import { Star, Shield, VerifiedIcon, SendHorizonal } from '@lucide/svelte';
	import { scale } from 'svelte/transition';
	import Plyr from "plyr";
	import 'plyr/dist/plyr.css';

	import { AnimeMobileClient } from '$lib/api/clients/mobile/animeClient';
	import type { IAnimeEpisodeDetail } from '$lib/api/types/mobile/episodeType';

	import LoadingElements from '$lib/components/ui/LoadingElements.svelte';
	// import CustomVideoPlayer from '$lib/components/complex/CustomVideoPlayer.svelte';

	export let data: IAnimeSlug;

	const QUALITY = {
		"360": 0,
		"480": 1,
		"720": 2
	}

	let animeDetail: IAnimeEpisodeDetail;
	let isLoading = true;

	let playerElement: HTMLElement;

	onMount(async () => {
		console.log(data.animeSlug);
		isLoading = true;
		const response = await AnimeMobileClient.getEpisode(data.animeSlug);
		animeDetail = response;
		console.log(response);
		isLoading = false;

		setTimeout(() => {
			console.log(animeDetail?.videoUrls[animeDetail?.videoUrls?.length - 1]);

			const player = new Plyr(playerElement, { controls: [
					'play-large', // The large play button in the center
					'rewind', // Rewind by the seek time (default 10 seconds)
					'play', // Play/pause playback
					'fast-forward', // Fast forward by the seek time (default 10 seconds)
					'progress', // The progress bar and scrubber for playback and buffering
					'current-time', // The current time of playback
					'duration', // The full duration of the media
					'mute', // Toggle mute
					'settings', // Settings menu
					'pip', // Picture-in-picture (currently Safari only)
					'airplay', // Airplay (currently Safari only)
					'fullscreen', // Toggle fullscreen
				],
				quality: {
					default: 360,
					options: [360, 480, 720],
					forced: true,
					onChange(quality) {
						console.log('Quality changed to:', quality);
						console.log(animeDetail?.videoUrls.length - ((QUALITY as any)[quality]))
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
			player.on('play', () => console.log('Video playing!'));
		}, 10)

	});
</script>

{#if isLoading}
	<LoadingElements />
{:else}
	<div class="mx-auto max-w-md pb-20 text-white" in:scale={{ duration: 200, start: 0.95 }}>
		{#if Array.isArray(animeDetail?.videoUrls) && animeDetail?.videoUrls.length > 0}
			<!-- <CustomVideoPlayer videoUrl={animeDetail?.videoUrls[animeDetail?.videoUrls?.length - 1]} /> -->

			<div class="container">
				<video bind:this={playerElement} src={animeDetail?.videoUrls[animeDetail?.videoUrls?.length - 1]} controls crossorigin="anonymous" playsinline poster="/web-app-manifest-512x512.png">
					{#each animeDetail?.videoUrls as videoUrl}
						<source src={videoUrl} type="video/mp4" />
					{/each}
						
						<!-- Caption files -->
						<track kind="captions" label="English" srclang="en" src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.en.vtt"
								default>

						<!-- Fallback for browsers that don't support the <video> element -->
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
			<h1 class="text-2xl font-extrabold leading-tight">{(animeDetail?.title || "").replace("- Kuramanime", "")}</h1>
			<p class="mb-4 mt-1 text-base font-normal">Episode {(animeDetail?.isEpisode || "-")}</p>
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
			<div class="mb-6 flex flex-wrap gap-3">
				<!-- <button
					class="flex items-center gap-2 rounded-md bg-[#3a3a4a] px-4 py-2 text-sm font-semibold"
				>
					<i class="fas fa-arrow-down"> </i>
					Download
				</button> -->
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
						<p class="ml-auto text-xs font-semibold text-gray-400">Lv. 999</p>
					</div>
					<p class="font-normal uppercase leading-snug text-white">
						PENGEN BACKGROUND KOMENTAR CUSTOM GINI ? AYO BELI VIP
					</p>
					<div class="flex justify-between text-xs font-normal text-gray-400">
						<span> 1 Menit yang lalu </span>
						<button class="font-bold text-white"> Balas (0) </button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
