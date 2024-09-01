<script>
	import { SELECTION_STEPS, DUTY_POINTS } from '$lib/stores/selectionProgress';
	import SheetLabel from './SheetLabel.svelte';
	import { fly } from 'svelte/transition';

	export let transitionIn;
</script>

<div {...$$restProps} class="scroll-snap-start pb-1" in:fly="{transitionIn}">
	<div class="row">
		<SheetLabel text="{$SELECTION_STEPS[1].sheetLabel}" />
		<div class="col-sm-12 h-50-vh d-flex flex-row-gap-1 flex-column align-items-center justify-content-center">
			<div class="col-lg-4 col-sm-6">
				<label for="input-q" class="form-label fs-sm-md clr-blue-dark"
					>Значение расхода, м<sup>3</sup>/час.</label
				>
				<input
					id="input-q"
					class="form-control w-max-450"
					type="number"
					bind:value="{$DUTY_POINTS.q}"
					autofocus
				/>
			</div>
			<div class="col-lg-4 col-sm-6">
				<label for="input-q" class="form-label fs-sm-md clr-blue-dark">Значение напора, м</label>
				<input
					id="input-q"
					class="form-control w-max-450"
					type="number"
					bind:value="{$DUTY_POINTS.h}"
				/>
			</div>
		</div>
	</div>
</div>

<style lang="scss" scoped>
	.w-max-450 {
		max-width: 450px;
	}
</style>
