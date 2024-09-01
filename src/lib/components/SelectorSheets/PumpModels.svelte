<script>
	import {
		SELECTION_STEPS,
		SELECTED_PUMP_MODEL_ID,
		CURRENT_STEP,
		DUTY_POINTS
	} from '$lib/stores/selectionProgress';
	import { PumpModel, Attribute } from '$lib/types';
	import { onMount } from 'svelte';
	import SheetLabel from './SheetLabel.svelte';
	import { fly } from 'svelte/transition';

	export let transitionIn;

	/**
	 * @type {any[]}
	 */
	let charts = [];

	onMount(() => {
		drawCharts();

		return () => destroyCharts();
	});

	function drawCharts() {
		if (charts.length > 0) destroyCharts();

		charts = [
			new CanvasJS.Chart('canvasjs-container-h-npsh'),
			new CanvasJS.Chart('canvasjs-container-eff'),
			new CanvasJS.Chart('canvasjs-container-p')
		];

		charts[0].options = {
			animationEnabled: true,
			axisX: {
				title: 'Расход, м. куб./час',
				titleFontSize: 14,
				titleFontWeight: 700
			},
			axisY: {
				title: 'Напор/ NPSHr, м',
				titleFontSize: 14,
				titleFontWeight: 700
			},
			data: [
				{
					type: 'line',
					dataPoints: currentPumpModel.pump_duty_points.map((dp) =>
						Object.assign({}, { x: dp.q, y: dp.h })
					),
					color: '#30853a',
					toolTipContent: 'Расход: {x} м3/ч, H: {y}м',
					markerType: 'none'
				},

				{
					type: 'line',
					dataPoints: currentPumpModel.pump_duty_points.map((dp) =>
						Object.assign({}, { x: dp.q, y: dp.npsh })
					),
					color: '#234c8c',
					toolTipContent: 'Расход: {x} м3/ч, NPSHr: {y}м',
					markerType: 'none'
				}
			]
		};

		charts[1].options = {
			animationEnabled: true,
			axisX: {
				title: 'Расход, м. куб./час',
				titleFontSize: 14,
				titleFontWeight: 700
			},
			axisY: {
				title: 'КПД, %',
				titleFontSize: 14,
				titleFontWeight: 700
			},
			data: [
				{
					type: 'line',
					dataPoints: currentPumpModel.pump_duty_points.map((dp) =>
						Object.assign({}, { x: dp.q, y: dp.eff })
					),
					color: '#3179b4',
					toolTipContent: 'Расход: {x} м3/ч, КПД: {y}%',
					markerType: 'none'
				}
			]
		};

		charts[2].options = {
			animationEnabled: true,
			axisX: {
				title: 'Расход, м. куб./час',
				titleFontSize: 14,
				titleFontWeight: 700
			},
			axisY: {
				title: 'Мощность, кВт',
				titleFontSize: 14,
				titleFontWeight: 700
			},
			data: [
				{
					type: 'line',
					dataPoints: currentPumpModel.pump_duty_points.map((dp) =>
						Object.assign({}, { x: dp.q, y: dp.p })
					),
					color: '#94c32c',
					toolTipContent: 'Расход: {x} м3/ч, Мощность: {y},кВт',
					markerType: 'none'
				}
			]
		};

		//добавляем на график производительности запрашиваемую и фактическую РД
		const dpRequested = {
				type: 'scatter',
				xValueFormatString: '#######.00',
				yValueFormatString: '#######.00',
				name: 'dp_requested',
				color: '#f0c630',
				markerSize: 12.5,
				dataPoints: [{ x: $DUTY_POINTS.q || 0, y: $DUTY_POINTS.h }],
				toolTipContent: 'Расход запр.: {x} м3/ч, Напор запр: {y},кВт'
			},
			dpActual = {
				type: 'scatter',
				xValueFormatString: '#######.00',
				yValueFormatString: '#######.00',
				name: 'dp_actual',
				color: '#f05630',
				markerSize: 12.5,
				dataPoints: [
					{
						x: parseInt(
							currentPumpModel.attributes.find(
								(/**@type {Attribute}*/ n) => n.attribute_id === 1
							)?.value || 0
						),
						y: parseInt(
							currentPumpModel.attributes.find(
								(/**@type {Attribute}*/ n) => n.attribute_id === 2
							)?.value || 0
						)
					}
				],
				toolTipContent: 'Расход факт.: {x} м3/ч, Напор факт: {y},кВт'
			};

		const firstChart = charts[0];

		const dpRequestedIdx = firstChart.options.data.findIndex(
			(/** @type {{ name: String; }} */ item) => item.name === 'dp_requested'
		);
		if (dpRequestedIdx !== -1) firstChart.options.data.splice(dpRequestedIdx, 1);
		firstChart.options.data.push(dpRequested);

		const dpActualIdx = firstChart.options.data.findIndex(
			(/** @type {{ name: String; }} */ item) => item.name === 'dp_actual'
		);
		if (dpActualIdx !== -1) firstChart.options.data.splice(dpActualIdx, 1);
		firstChart.options.data.push(dpActual);

		charts.forEach((chart) => chart.render());
	}

	function destroyCharts() {
		charts.forEach((chart) => chart.destroy());
	}

	/**@type {PumpModel}*/
	let currentPumpModel = $SELECTION_STEPS[2].actionHandler.history[$SELECTED_PUMP_MODEL_ID];

	/**
	 * @param {String} modelName
	 */
	function chipModelName(modelName) {
		return modelName.length <= 10 ? modelName : modelName.slice(0, 10) + '...';
	}

	/**
	 * @param {Number} id
	 */
	async function selectPumpModel(id) {
		SELECTED_PUMP_MODEL_ID.update((v) => (v = id));

		await $CURRENT_STEP.actionHandler.addItemToHistory($SELECTED_PUMP_MODEL_ID, 'get_pump_model_by_id');
		currentPumpModel = $SELECTION_STEPS[2].actionHandler.history[$SELECTED_PUMP_MODEL_ID];
		drawCharts();
	}
</script>

<div {...$$restProps} class="scroll-snap-start pb-1" in:fly="{transitionIn}">
	<div class="row flex-row-gap-1">
		<SheetLabel text="{$SELECTION_STEPS[2].sheetLabel}" />

		<div class="col-sm-12">
			<strong class="fs-sm-md clr-blue-dark pos-r">Вам подойдут:</strong>
			<div
				class="w-100 no-scrollbars overflow-x-scroll d-flex flex-nowrap flex-column-gap-1 pos-sticky bottom-left"
			>
				{#each $SELECTION_STEPS[2].actionHandler.listOfItems as item}
					<button
						class="btn btn-sm rounded bg-clr-blue clr-white o-{Number(item.id) ===
						currentPumpModel.id
							? 1
							: '0-6'}"
						title="{item.name}"
						on:click="{() => selectPumpModel(item.id)}"
					>
						{chipModelName(item.name)}
					</button>
				{/each}
			</div>
		</div>

		<div class="col-sm-12 text-center">
			<h6 class="fs-md">{currentPumpModel.short_desc}</h6>
			<h4 class="fs-md-lg">{currentPumpModel.name}</h4>
		</div>

		<div class="col-md-6 sol-sm-12 d-flex flex-column flex-row-gap-0-5">
			<div class="w-100 h-30-vh" id="canvasjs-container-h-npsh"></div>
			<div class="w-100 h-30-vh" id="canvasjs-container-eff"></div>
			<div class="w-100 h-30-vh" id="canvasjs-container-p"></div>
		</div>
		<div class="col-md-6 col-sm-12 bg-clr-white-beige rounded-3 p-4">
			<div class="list-of-attributes fs-sm-md">
				<div class="col-1-span-3"><strong>Запрашиваемые параметры</strong></div>
				<div class="ps-2"><span>Расход</span></div>
				<div><strong>{$DUTY_POINTS.q} м<sup>3</sup>/ч</strong></div>
				<div class="ps-2"><span>Напор</span></div>
				<div><strong>{$DUTY_POINTS.h} м</strong></div>

				<div class="col-1-span-3"><strong>Фактические параметры</strong></div>
				{#each currentPumpModel.attributes.filter( (/** @type {Attribute} */ attr) => [1, 2, 12].includes(attr.attribute_id) ) as attr (attr.attribute_id)}
					<div class="ps-2"><span>{attr.name}</span></div>
					<div><strong>{attr.value}</strong></div>
				{/each}

				<div class="col-1-span-3"><strong>Данные электродвигателя</strong></div>
				{#each currentPumpModel.attributes.filter( (/** @type {Attribute} */ attr) => [49, 51, 52].includes(attr.attribute_id) ) as attr (attr.attribute_id)}
					<div class="ps-2"><span>{attr.name}</span></div>
					<div><strong>{attr.value}</strong></div>
				{/each}

				<div class="col-1-span-3"><strong>Данные установки</strong></div>
				{#each currentPumpModel.attributes.filter( (/** @type {Attribute} */ attr) => [18, 19].includes(attr.attribute_id) ) as attr (attr.attribute_id)}
					<div class="ps-2"><span>{attr.name}</span></div>
					<div><strong>{attr.value}</strong></div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style lang="scss" scoped>
	.list-of-attributes {
		display: grid;
		grid-template-columns: 65% 35%;
	}

	.col-1-span-3 {
		grid-column: 1/3;
		padding: 1rem 0 0.25rem 0;
	}
</style>
