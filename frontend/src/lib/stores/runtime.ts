import { writable } from "svelte/store";
import { MAX_RUNTIME_CACHE_MOBILE } from "$lib/config/app";

export const runtimeData = writable<Record<string, any>>({});
export const runtimeMobile = writable<Record<string, any>>({});

runtimeMobile.subscribe((value) => {
  if (Object.keys(value).length > MAX_RUNTIME_CACHE_MOBILE) {
    runtimeMobile.update((prev) => {return {...Object.fromEntries(Object.entries(prev).slice(1))}})
  }
})