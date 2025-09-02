<script lang="ts">
	import '../../app.css';
	import { mode, fullscreen } from '$lib/stores/mode';

	import Navbar from '$lib/components/complex/Navbar.svelte';
	import { Toaster } from 'svelte-french-toast';
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/state';
	import { ONLINE_DELAY } from '$lib/config/app';
	import { UserMobileClient } from '$lib/api/clients/mobile/userClient';

	import Maintenance from '$lib/components/ui/Maintenance.svelte';

	const user = page.data?.user;
	const serverStatus = page.data?.serverStatus || "active";

	let interval: NodeJS.Timeout;

	interface PushSubscriptionJSON {
		endpoint: string;
		expirationTime: number | null;
		keys: {
			p256dh: string;
			auth: string;
		};
	}

	async function registerServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
		if ('serviceWorker' in navigator) {
			try {
				const registration = await navigator.serviceWorker.register('/service-worker.js');
				console.log('✅ Service Worker registered:', registration);
				return registration;
			} catch (err) {
				console.error('❌ Failed to register Service Worker', err);
			}
		} else {
			console.warn('⚠️ Service Worker not supported in this browser');
		}
	}

	async function subscribePush(registration: ServiceWorkerRegistration): Promise<void> {
		if (!('PushManager' in window)) {
			console.warn('⚠️ Push not supported in this browser');
			return;
		}

		const permission = await Notification.requestPermission();
		if (permission !== 'granted') {
			console.warn('⚠️ Notification permission denied');
			return;
		}

		try {
			const subscription = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array('<YOUR_VAPID_PUBLIC_KEY>')
			});

			const subscriptionJSON: PushSubscriptionJSON = subscription.toJSON() as any;
			console.log('📌 Push subscription:', subscriptionJSON);

			await fetch('/api/save-subscription', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(subscriptionJSON)
			});

			console.log('✅ Push subscription sent to server');
		} catch (err) {
			console.error('❌ Failed to subscribe for push', err);
		}
	}

	function urlBase64ToUint8Array(base64String: string): any {
		if (typeof window !== "undefined") {
			const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
			const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
			const rawData = atob(base64);
			const outputArray = new Uint8Array(rawData.length);
	
			for (let i = 0; i < rawData.length; ++i) {
				outputArray[i] = rawData.charCodeAt(i);
			}
			return outputArray;
		}

		return new Uint8Array([]);
	}

	async function initPush(): Promise<void> {
		const registration = await registerServiceWorker();
		if (registration) {
			await subscribePush(registration);
		}
	}

	function onPop(e: PopStateEvent) {
		console.log("Kembali");
	}

	onMount(() => {
		if (typeof window != 'undefined') {
			UserMobileClient.sendOnline();
			if ('scrollRestoration' in history) {
				history.scrollRestoration = 'manual';
			}

			if (serverStatus == "maintenance") {
				fullscreen.set(true);
			}

			if (user) {
				interval = setInterval(() => {
					UserMobileClient.sendOnline();
				}, ONLINE_DELAY)
			}
		}

		if (typeof window != 'undefined') {
			// initPush();
		}

    function initBackButtonInterceptor() {
      // history.pushState({ key: "initial" }, "", "");
      console.log("Event popstate aktif")

      window.addEventListener('popstate', onPop);
    }

    initBackButtonInterceptor();
	});

	onDestroy(() => {
		if (typeof window != 'undefined') {
			console.log("Event popstate gak aktif");
			window.removeEventListener('popstate', onPop);

			if (user) {
				clearInterval(interval);
			}
		}
	});

	mode.set('flat');

	let { children } = $props();
</script>

<Navbar />
{#if serverStatus == "maintenance"}
	<Maintenance />
{:else}
	{@render children()}
{/if}
<Toaster />
