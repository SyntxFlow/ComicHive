<script lang="ts">
	import { ArrowLeft, SlidersHorizontal, Search, Star } from '@lucide/svelte';
	import { scale } from 'svelte/transition';
	import { AnimeMobileClient } from '$lib/api/clients/mobile/animeClient';
	import type { Datum } from '$lib/api/types/mobile/searchType';
	import { runtimeData } from '$lib/stores/runtime';
	import { onMount, onDestroy } from 'svelte';

	import LoadingElements from '../ui/LoadingElements.svelte';

	import { truncate } from '$lib';

	const MAX_SEGMENT = 5;

	let query: string = '';
	let isLoading = false;
	let animeList: Datum[] = [];
	let first = true;
	let segmentList: Datum[] = [];

	let isLoadingInter = false;

	let animeListElement: HTMLUListElement;
	let lastObserved: Element | undefined;
	let obs: IntersectionObserver;
	let htmlInputElement: HTMLInputElement;

	async function searchAnimeQuery() {
		if (query || query.trim() != '') {
			lastObserved = undefined;
			htmlInputElement.blur();
			first = false;
			isLoading = true;
			const response = await AnimeMobileClient.getSearch(query);
			animeList = response;
			segmentList = response.slice(0, MAX_SEGMENT);
			$runtimeData['search.cache'] = response;
			isLoading = false;
		}
	}

	function handleIntersect(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				// stop observing the old target
				obs.unobserve(entry.target);
				loadMoreSegment();
			}
		}
	}

	function loadMoreSegment() {
		if (!isLoadingInter) {
			isLoadingInter = true;
			segmentList = animeList.slice(
				0,
				Math.min(segmentList.length + MAX_SEGMENT, animeList.length)
			);
			$runtimeData['search.segment'] = segmentList;
			setTimeout(() => {
				isLoadingInter = false;
			}, 100);
		}
	}

	$: {
		if (animeListElement || isLoadingInter) {
      const children = animeListElement.children;
      const last = children[children.length - 1];
      if (last && last !== lastObserved) {
        // if (lastObserved) obs.unobserve(lastObserved);
        obs.observe(last);
        lastObserved = last;
      }
    };
	}

	onMount(() => {
		obs = new IntersectionObserver(handleIntersect, { threshold: 1 });

		if ($runtimeData['search.cache'] && $runtimeData['search.cache']?.length) {
			first = false;
			animeList = $runtimeData['search.cache'];
			if ($runtimeData['search.segment'] && $runtimeData['search.segment']?.length) {
				segmentList = $runtimeData["search.segment"];
			}
		}
	});

	onDestroy(() => {
		if (obs) obs.disconnect();
	});
</script>

<div class="pt-15 px-5 pb-[70px] text-white" in:scale={{ duration: 200, start: 0.95 }}>
	<div class="!fixed left-0 top-0 z-10 block h-auto w-full bg-black p-4">
		<div class="flex h-auto w-full items-center justify-between">
			<button on:click={() => window.history.back()}>
				<ArrowLeft />
			</button>
			<h1 class="text-[20px] font-bold">Search</h1>
			<SlidersHorizontal />
		</div>
		<div class="relative mt-5">
			<button
				class="absolute bottom-0 left-3 top-0 my-auto"
				on:click={() => {
					if (!isLoading) searchAnimeQuery();
				}}
			>
				<Search />
			</button>
			<input
				class="bg-dark h-auto w-full rounded-2xl border border-white/10 p-2 pl-12 outline-none"
				type="text"
				bind:value={query}
				bind:this={htmlInputElement}
				required
				on:keydown={(e) => {
					if (e.key == 'Enter' && !isLoading) searchAnimeQuery();
				}}
				placeholder="Attack On Titan"
			/>
		</div>
	</div>

	<div class="mt-17">
		{#if first}
			<div class="flex h-full w-full flex-col items-center justify-center">
				<video class="h-50 w-50 object-cover object-top" autoplay muted loop>
					<source src="/images/when.mp4" />
				</video>
				<h1 class="text-title-medium mt-5 w-auto text-start opacity-70">
					Kapan yah kaya orang orang ...
				</h1>
			</div>
		{:else if isLoading}
			<div class="flex h-full w-full flex-col items-center justify-center">
				<LoadingElements variant="normal" />
			</div>
		{:else if animeList.length == 0 && !isLoading}
			<div class="flex h-full w-full flex-col items-center justify-center">
				<h1 class="text-title-medium mt-5 w-auto text-start opacity-70">
					Tidak menemukan apa apa :(
				</h1>
			</div>
		{:else}
			<h1 class="text-title-large mb-5 font-semibold opacity-70">Relevan result</h1>
			<a href="/mobile/anime/{animeList[0].id}/{animeList[0].slug}">
				<div class="w-full">
					<img
						class="h-[200px] w-full rounded-2xl object-cover"
						src={animeList[0].image_portrait_url}
						alt={animeList[0].title}
					/>
					<div class="mt-3 flex flex-col justify-between">
						<h1 class="text-title-medium font-semibold">
							{animeList[0].title}
						</h1>
						<div class="my-2 flex items-center gap-2">
							<span class="block h-[10px] w-[10px] rounded-full bg-yellow-500"></span>
							<h1 class="text-label-small opacity-80">{animeList[0].status}</h1>
							<div class="text-label-small ml-auto flex items-center gap-5">
								<h1 class="opacity-80">{animeList[0].aired_from}</h1>
								<div class="flex items-center gap-2">
									<Star size="15" fill="green" color="green" />
									<h1 class="text-green-500 opacity-80">{animeList[0].score}</h1>
								</div>
							</div>
						</div>
						<div class="text-label-small flex flex-nowrap items-center gap-3 overflow-x-auto">
							<span class="text-red-500">{animeList[0].posts?.length} Current Eps</span>
							<span class="text-red-500">{animeList[0].total_episodes} Total Eps</span>
							<span class="text-red-500">{animeList[0].rating}</span>
						</div>
						<div class="text-label-small mt-1 flex flex-nowrap items-center gap-3 overflow-x-auto">
							{#each animeList[0]?.genres || [] as genre}
								<span class="rounded-md bg-red-500 px-2 py-1 text-white">{genre.label}</span>
							{/each}
						</div>
					</div>
				</div>
			</a>

			<ul class="mt-7" bind:this={animeListElement}>
				{#each segmentList as anime, i (i)}
					<li class="mt-5">
						<a href="/mobile/anime/{anime.id}/{anime.slug}">
							<div class="grid w-full grid-cols-[120px_1fr] justify-start gap-3">
								<img
									class="h-full w-full shrink-0 rounded-2xl object-cover"
									src={anime.image_portrait_url}
									alt={anime.title}
								/>
								<div class="flex w-full min-w-0 flex-col justify-between">
									<h1 class="text-title-medium font-semibold">{truncate(anime.title || '', 50)}</h1>
									<div>
										<h1 class="text-label-small opacity-80">Source: {anime.source}</h1>
										<h1 class="text-label-small opacity-80">Votes: {anime.votes}</h1>
										<div class="my-2 flex items-center gap-2">
											<span class="block h-[10px] w-[10px] rounded-full bg-green-500"></span>
											<h1 class="text-label-small opacity-80">{anime.status}</h1>
										</div>
										<div class="text-label-small flex items-center gap-5">
											<h1 class="opacity-80">{anime.aired_from}</h1>
											<div class="flex items-center gap-2">
												<Star size="15" fill="green" color="green" />
												<h1 class="text-label-small text-green-500 opacity-80">{anime.score}</h1>
											</div>
										</div>
										<div
											class="text-label-small no-scroll flex flex-nowrap items-center gap-3 overflow-x-auto text-nowrap"
										>
											<span class="text-red-500">{anime.posts?.length} Current Eps</span>
											<span class="text-red-500">{anime.total_episodes} Total Eps</span>
											<span class="text-red-500">{anime.rating}</span>
										</div>
										<div
											class="text-label-small mt-1 flex flex-nowrap no-scroll items-center gap-3 overflow-x-auto"
										>
											{#each anime?.genres || [] as genre}
												<span class="rounded-md bg-red-500 px-2 py-1 text-white whitespace-nowrap">{genre.label}</span
												>
											{/each}
										</div>
									</div>
								</div>
							</div>
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
