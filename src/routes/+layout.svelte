<script>
	import { onMount } from 'svelte';
	import { IS_MOBILE, SHOW_LOADER, ALERT } from '$lib/stores/ui';

	//Компоненты
	import GutterXY from '$lib/components/Gutters/GutterXY.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Filter from '$lib/components/Filter.svelte';

	/**@type {Number}*/
	let innerWidth,
		breakPoint = 800,
		mounted = false;

	onMount(() => {
		mounted = true;
		IS_MOBILE.set(innerWidth < breakPoint);
	});

	$: if (innerWidth) {
		IS_MOBILE.update((v) => (v = innerWidth < breakPoint));
	}

	$: if ($ALERT.show && mounted)
		setTimeout(() => {
			ALERT.update((al) => {
				al.show = false;

				return al;
			});
		}, 4000);
</script>

<svelte:window bind:innerWidth />

<Header />
<main class="w-100 h-100 flex-grow-1">
	<GutterXY>
		{#if $SHOW_LOADER}
			<Loader />
		{/if}

		{#if $ALERT.show}
			<Alert type="{$ALERT.type}" msg="{$ALERT.msg}" />
		{/if}

		<Filter />
		<slot />
	</GutterXY>
</main>
<Footer />
