<svelte:options accessors />

<script>
	import { fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	/**@type {string}*/
	export let content;
	/**@type {boolean}*/
	export let showError = false;

	const hideError = () => {
		showError = false;
	};

	onMount(() => {
		window.addEventListener('keydown', hideError);
		return () => window.removeEventListener('keydown', hideError);
	});
</script>

{#if showError}
	<div class="card" in:fly="{{ y: -100, duration: 500 }}" out:fly="{{ y: -100, duration: 500 }}">
		<div class="card-header">
			<button class="btn btn-sm bg-clr-transparent border-0 rounded-circle" on:click="{hideError}">
				<Icon icon="material-symbols:close-small" style="color: #051618" />
			</button>
		</div>
		<div class="card-body w-100 h-100">
			<div
				class="card-text embed-responsive w-100 h-100 text-center d-flex flex-column justify-content-center"
			>
				<slot>{@html content}</slot>
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	.card {
		position: fixed;
		z-index: 1000;
		width: 100%;
		height: 90vh;
		margin: 0 10px;
		top: 5vh;
	}
</style>
