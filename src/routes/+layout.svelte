<script>
	import { onMount } from 'svelte';
	import { IS_MOBILE, SHOW_LOADER, ALERT, SHOW_SELECTION_HISTORY, MAIN_CONTAINER_RECT_DIMS } from '$lib/stores/ui';

	//Компоненты
	import GutterXY from '$lib/components/Gutters/GutterXY.svelte';
	import Loader from '$lib/components/Loader.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import SelectionHistory from '$lib/components/SelectionHistory.svelte';

	/**@type {Number}*/
	let innerWidth,
		breakPoint = 800,
		mounted = false;

	onMount(() => {
		mounted = true;
		IS_MOBILE.set(innerWidth < breakPoint);

		console.log($MAIN_CONTAINER_RECT_DIMS);
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
<main
	class="w-100 h-100 flex-grow-1"
	bind:offsetHeight="{$MAIN_CONTAINER_RECT_DIMS.height}"
	bind:offsetWidth="{$MAIN_CONTAINER_RECT_DIMS.width}"
>
	<GutterXY>
		{#if $SHOW_LOADER}
			<Loader />
		{/if}

		{#if $ALERT.show}
			<Alert type="{$ALERT.type}" msg="{$ALERT.msg}" />
		{/if}

		{#if $SHOW_SELECTION_HISTORY}
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
			<div
				role="region"
				class="pos-f top-left w-100 h-100 bg-clr-transparent z-2 d-flex justify-content-end"
				on:click|self="{() => ($SHOW_SELECTION_HISTORY = false)}"
			>
				<SelectionHistory />
			</div>
		{/if}
		<slot />
	</GutterXY>
</main>
<Footer />
