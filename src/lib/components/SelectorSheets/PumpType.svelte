<script>
	import { globals } from '$lib/globals';
	import { SELECTED_PUMP_TYPE_IDS, SELECTION_STEPS } from '$lib/stores/selectionProgress';
	import { IS_MOBILE } from '$lib/stores/ui';
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
		<div class="col-sm-12 w-100 h-100 mb-xxl-5"></div>
		{#each pumpTypes as type (type.id)}
			<div class="col-xxl-3 col-xl-4 col-lg-6 col-md-6 col-sm-12">
				<div
					class="px-3 py-2 bg-clr-white-beige hover-box-shadow-blue-light rounded-3 pos-r h-20-vh {$SELECTED_PUMP_TYPE_IDS.includes(
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

					<div class="d-flex flex-wrap align-items-center justify-content-between">
						<strong class="fs-lg clr-blue-dark px-2">{type.name}</strong>
						<img
							class="w-65 object-fit-contain ratio-1x1"
							alt="pump type"
							src="{globals.imagePath + type.images[0].img_url}"
							style="max-width: {!$IS_MOBILE ? 200 : 125}px;"
						/>

						<p class="fs-sm-md clr-blue-dark o-0-6 pt-2 text-center">{type.short_desc}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
