<script>
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';

	export let byX = false;

	onMount(() => {
		onElementResize();
		window.addEventListener('resize', onElementResize);

		return () => window.removeEventListener('resize', onElementResize);
	});

	/**@type {HTMLDivElement}*/
	let DOMScrollableEl;

	function onElementResize() {
		setIsScrollable();

		if (!isScrollableByX) return;
		setScrollState();
	}

	let isScrollableByX = false;
	function setIsScrollable() {
		isScrollableByX = DOMScrollableEl.scrollWidth > DOMScrollableEl.clientWidth;
	}

	let isScrolledToStart = false;
	let isScrolledToEnd = false;
	function setScrollState() {
		const scrollLeftVal = DOMScrollableEl.scrollLeft;

		isScrolledToStart = scrollLeftVal === 0;
		isScrolledToEnd = scrollLeftVal === DOMScrollableEl.scrollWidth - DOMScrollableEl.offsetWidth;
	}

	let scrollStep = 200;
	function onScrollLeftClick() {
		if (isScrolledToStart) return;
		DOMScrollableEl.scrollBy({ top: 0, left: -scrollStep, behavior: 'smooth' });
	}

	function onScrollRightClick() {
		if (isScrolledToEnd) return;
		DOMScrollableEl.scrollBy({ top: 0, left: scrollStep, behavior: 'smooth' });
	}
</script>

{#if byX}
	<div
		class="w-100 overflow-x-auto d-flex flex-nowrap flex-column-gap-1 no-scrollbars pos-r"
		bind:this="{DOMScrollableEl}"
		on:scroll="{setScrollState}"
	>
		{#if isScrollableByX}
			<button
				class="border-none outline-none bg-clr-white pos-sticky top-left z-1 o-{!isScrolledToStart
					? 1
					: '0-6'}"
				on:click="{onScrollLeftClick}"
			>
				<Icon
					icon="material-symbols:chevron-left-rounded"
					width="24"
					height="24"
					style="color: #051618"
				/>
			</button>
		{/if}

		<slot></slot>

		{#if isScrollableByX}
			<button
				class="border-none outline-none bg-clr-white pos-sticky top-right z-1 o-{!isScrolledToEnd
					? 1
					: '0-6'}"
				on:click="{onScrollRightClick}"
			>
				<Icon icon="material-symbols:chevron-right" width="24" height="24" style="color: #051618" />
			</button>
		{/if}
	</div>
{:else}
	<div></div>
{/if}
