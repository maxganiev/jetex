import { readable, derived } from 'svelte/store';

export const CHARTS_WRAPPER_ELEMS_IDS = readable([
		'canvasjs-container-h-npsh',
		'canvasjs-container-eff',
		'canvasjs-container-h-p'
	]),
	SHADOWED_CHARTS_WRAPPER_ELEMS_IDS = derived([CHARTS_WRAPPER_ELEMS_IDS], ([$CHARTS_WRAPPER_ELEMS_IDS], set) => {
		set($CHARTS_WRAPPER_ELEMS_IDS.map((id) => 'shadowed_' + id));
	});
