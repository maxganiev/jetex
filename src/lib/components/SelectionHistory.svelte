<script>
	import { SELECTED_PUMP_MODEL_ID, SELECTION_STEPS } from '$lib/stores/selectionProgress';
	import { SHOW_SELECTION_HISTORY, IS_MOBILE } from '$lib/stores/ui';
	import { fly } from 'svelte/transition';
	import { backIn, backOut } from 'svelte/easing';
	import Icon from '@iconify/svelte';

	async function selectPumpModel(id) {
		SELECTED_PUMP_MODEL_ID.set(id);
	}
</script>

<div
	class="p-4 h-100-vh z-2 bg-clr-gray-light clr-blue-light fs-md w-{!$IS_MOBILE ? '35-vw' : '100'}"
	style="max-width: 500px;"
	in:fly="{{ delay: 50, duration: 300, x: 100, easing: backIn }}"
	out:fly="{{ delay: 50, duration: 300, x: 100, easing: backOut }}"
>
	<div class="clr-blue-dark">
		<button
			class="btn btn-sm rounded-circle border-0 bg-clr-transparent p-0"
			style="width: 2em; height: 2em;"
			on:click="{() => ($SHOW_SELECTION_HISTORY = !$SHOW_SELECTION_HISTORY)}"
		>
			<Icon icon="material-symbols:close" style="color: #234c8c" width="2em" height="2em" />
		</button>

		<br />

		<strong class="fs-md d-block mt-5">Вы выбирали:</strong>
		{#if Object.keys($SELECTION_STEPS[2].actionHandler.history).length === 0}
			<p class="fs-md pt-4">Здесь пока ничего нет.</p>
		{:else}
			<ul class="list no-bullets mt-3">
				{#each Object.keys($SELECTION_STEPS[2].actionHandler.history) as key, idx (idx)}
					{@const item = $SELECTION_STEPS[2].actionHandler.history[key]}
					<li
						><button
							class="btn btn-transparent pos-r border-0 {$SELECTED_PUMP_MODEL_ID === item.id
								? 'active-blue-dark'
								: ''}"
							on:click="{() => selectPumpModel(item.id)}">{item.name}</button
						></li
					>
				{/each}
			</ul>
		{/if}
	</div>
</div>
