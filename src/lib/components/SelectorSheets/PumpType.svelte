<script>
	import { globals } from '$lib/globals';
	import { SELECTED_PUMP_TYPE_IDS, SELECTION_STEPS } from '$lib/stores/selectionProgress';
	import { PumpType } from '$lib/types';
	import SheetLabel from './SheetLabel.svelte';
	import { fly } from 'svelte/transition';

	/**@type {PumpType[]}*/
	export let pumpTypes = [],
		transitionIn;
</script>

<div {...$$restProps} class="scroll-snap-start pb-1" in:fly="{transitionIn}">
	<div class="row flex-row-gap-1">
		<SheetLabel text="{$SELECTION_STEPS[0].sheetLabel}" />
		{#each pumpTypes as type (type.id)}
			<div class="col-xl-4 col-lg-6 col-md-6 col-sm-12">
				<div
					class="p-4 bg-clr-white-beige hover-box-shadow-blue-light rounded-3 pos-r h-20-vh {$SELECTED_PUMP_TYPE_IDS.includes(
						Number(type.id)
					)
						? 'active-green-dark'
						: ''} hover-scale-1-01"
				>
					<input
						type="checkbox"
						class="o-0 z-1 w-100 h-100 pos-a cursor-pointer"
						value="{type.id}"
						bind:group="{$SELECTED_PUMP_TYPE_IDS}"
					/>

					<div class="d-flex flex-wrap align-items-center justify-content-between py-2 px-2">
						<strong class="fs-sm-md clr-blue-dark">{type.name}</strong>
						<img
							class="w-65 object-fit-contain ratio-1x1"
							alt="pump type"
							src="{globals.imagePath + type.images[0].img_url}"
							style="max-width: 200px;"
						/>

						<p class="fs-sm-md clr-blue-dark o-0-6 pt-5 text-center">{type.short_desc}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
