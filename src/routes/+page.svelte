<script>
	import DutyPoints from '$lib/components/SelectorSheets/DutyPoints.svelte';
	import PumpModels from '$lib/components/SelectorSheets/PumpModels.svelte';
	import PumpType from '$lib/components/SelectorSheets/PumpType.svelte';
	import { CURRENT_STEP_IDX } from '$lib/stores/selectionProgress';
	import { backInOut } from 'svelte/easing';

	export let data;

	/**@type {Object <Number, Object>}*/
	const components = {
		0: {
			comp: PumpType,
			props: { pumpTypes: data.pumpTypes }
		},

		1: {
			comp: DutyPoints,
			props: {}
		},

		2: {
			comp: PumpModels,
			props: {}
		}
	};

	$: componentToRender = components[$CURRENT_STEP_IDX];
	$: if (componentToRender) componentToRender.props.transitionIn = { duration: 400, x: -100, easing: backInOut };
</script>

<svelte:head>
	<title>Конфигуратор насосов JETEX</title>
</svelte:head>

<div class="no-scrollbars selector-sheets-wrapper overflow-y-hidden overflow-x-hidden">
	<svelte:component this="{componentToRender.comp}" {...componentToRender.props} />
</div>
