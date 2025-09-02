<script lang="ts">
  import { ArrowLeft, ArrowRight } from "@lucide/svelte";
  import { onMount } from "svelte";

  let images: HTMLImageElement[] = new Array<HTMLImageElement>(5);

  onMount(() => {
    if (typeof window != "undefined") {
      for (const image of images) {
        const imageSrc = image.dataset["src"];
        const imageLoad = new Image();
        imageLoad.src = imageSrc as string || "";

        imageLoad.onload = () => {
          image.src = imageSrc as string || "";
        }
      }
    }
  })
</script>

<div class="mt-5 pb-10">
  <button>
    <ArrowLeft color="white" size={25} class="ml-5" />
  </button>
  <h1 class="text-lg mt-2 mb-5 text-white text-center w-full">Kanan-sama wa Akumade Choroi Chapter 2</h1>
  <div class="mb-10">
    <img bind:this={images[0]} src="/placeholder.png" data-src="https://v2.yuucdn.net/wp-content/uploads/K/Kanan-sama wa Akumade Choroi/Chapter 02/002.jpg" alt="Manga">
    <img bind:this={images[1]} src="/placeholder.png" data-src="https://v2.yuucdn.net/wp-content/uploads/K/Kanan-sama wa Akumade Choroi/Chapter 02/002.jpg" alt="Manga">
    <img bind:this={images[2]} src="/placeholder.png" data-src="https://v2.yuucdn.net/wp-content/uploads/K/Kanan-sama wa Akumade Choroi/Chapter 02/002.jpg" alt="Manga">
    <img bind:this={images[3]} src="/placeholder.png" data-src="https://v2.yuucdn.net/wp-content/uploads/K/Kanan-sama wa Akumade Choroi/Chapter 02/002.jpg" alt="Manga">
    <img bind:this={images[4]} src="/placeholder.png" data-src="https://v2.yuucdn.net/wp-content/uploads/K/Kanan-sama wa Akumade Choroi/Chapter 02/002.jpg" alt="Manga">
  </div>
  <div class="flex justify-between items-center px-5">
    <button class="text-white text-sm flex items-center"><ArrowLeft color="white" size={25} class="mr-1" /> Sebelumnya</button>
    <button class="text-white text-sm flex items-center">Selanjutnya <ArrowRight color="white" size={25} class="ml-1" /></button>
  </div>
</div>