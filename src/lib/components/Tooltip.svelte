<script>
	import { fade } from 'svelte/transition';

	/**@type {String}*/
	export let tipContent;

	/**@type {Number}*/
	export let showTipTimeout = 2200;

	export let tipStyle = {
		color: '#fff',
		background: '#234c8c',
		fontSize: '0.75rem'
	};

	let showTip = false;
	/** @type {Number}*/
	let tipPosX,
		/** @type {Number}*/
		tipPosY;

	/**
	 * @param {{ clientX: Number; clientY: Number; }} e
	 */
	function onMouseEnter(e) {
		tipPosX = e.clientX - 100;
		tipPosY = e.clientY + 20;
		showTip = true;
	}

	$: if (showTip)
		setTimeout(() => {
			showTip = false;
		}, showTipTimeout);
</script>

<div role="region" on:mouseenter="{onMouseEnter}" on:mouseleave="{() => (showTip = false)}">
	<slot />

	{#if showTip}
		<span
			class="rounded-3 p-3 d-inline-block pos-f z-1"
			style="color: {tipStyle.color}; background: {tipStyle.background}; font-size: {tipStyle.fontSize}; top: {tipPosY}px; left: {tipPosX}px;"
			transition:fade="{{ delay: 350, duration: 300 }}">{tipContent}</span
		>
	{/if}
</div>
