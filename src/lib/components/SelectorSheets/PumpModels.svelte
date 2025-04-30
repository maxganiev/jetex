<script>
	import {
		SELECTION_STEPS,
		SELECTED_PUMP_MODEL_ID,
		CURRENT_STEP,
		DUTY_POINTS,
		REAL_CALCULATED_DUTY_POINTS
	} from '$lib/stores/selectionProgress';
	import { PumpModel, Attribute } from '$lib/types';
	import { onMount } from 'svelte';
	import SheetLabel from './SheetLabel.svelte';
	import { fly } from 'svelte/transition';
	import { CHARTS_WRAPPER_ELEMS_IDS, SHADOWED_CHARTS_WRAPPER_ELEMS_IDS } from '$lib/stores/immutable';
	import Tooltip from '../Tooltip.svelte';
	import { IS_MOBILE } from '$lib/stores/ui';
	import RegionOverflow from '../RegionOverflow.svelte';
	import { calcPolynomialRegression } from '$lib/utils/calcPolynomialRegression';
	import { DutyPoint } from '$lib/types';

	export let transitionIn;

	/**
	 * @type {any[]}
	 */
	let charts = [],
		/**
		 * @type {any[]}
		 */
		shadowCharts = [];

	let mounted = false;

	onMount(() => {
		mounted = true;
		return () => destroyCharts();
	});

	function addRealPointToCurve() {
		try {
			$REAL_CALCULATED_DUTY_POINTS.q = currentPumpModel.q_closest_to_requested;

			if (currentPumpModel.h_calculated_with_polynom < 0)
				currentPumpModel.h_calculated_with_polynom = calcPolynomialRegression(
					Number($DUTY_POINTS.q),
					currentPumpModel.pump_duty_points.map((dp) => dp.q),
					currentPumpModel.pump_duty_points.map((dp) => dp.h),
					2
				).cubicPolynomial;

			$REAL_CALCULATED_DUTY_POINTS.h = currentPumpModel.h_calculated_with_polynom;

			const closestDutyPointIdx = currentPumpModel.pump_duty_points.findIndex(
					(dp) => dp.q === currentPumpModel.q_closest_to_requested
				),
				closestDutyPoint = currentPumpModel.pump_duty_points[closestDutyPointIdx];

			const dynamicDutyPointId = 1e6 * currentPumpModel.id;
			const dynamicDutyPointIndex = currentPumpModel.pump_duty_points.findIndex(
				(dp) => dp.id === dynamicDutyPointId
			);

			const newDynamicDutyPoint = new DutyPoint(
				dynamicDutyPointId,
				currentPumpModel.id,
				currentPumpModel.q_closest_to_requested,
				$REAL_CALCULATED_DUTY_POINTS.h,
				closestDutyPoint.eff,
				closestDutyPoint.p,
				closestDutyPoint.npsh
			);

			if (dynamicDutyPointIndex >= 0)
				currentPumpModel.pump_duty_points.splice(closestDutyPointIdx + 1, 1, newDynamicDutyPoint);
			else currentPumpModel.pump_duty_points.splice(closestDutyPointIdx + 1, 0, newDynamicDutyPoint);
		} catch (error) {
			console.log(error);
		}
	}

	function drawCharts() {
		if (charts.length > 0) destroyCharts();

		charts = $CHARTS_WRAPPER_ELEMS_IDS.map((wrapperId) => new CanvasJS.Chart(wrapperId));
		shadowCharts = $SHADOWED_CHARTS_WRAPPER_ELEMS_IDS.map((wrapperId) => new CanvasJS.Chart(wrapperId));

		addRealPointToCurve();

		// xAxisMinVal = Math.min($DUTY_POINTS.q, currentPumpModelQVal) - 2.5,
		// xAxisMaxVal = Math.max($DUTY_POINTS.q, currentPumpModelQVal) + 2.5;

		const titleFontSize = !$IS_MOBILE ? 14 : 12;

		charts[0].options = {
			animationEnabled: true,
			axisX: {
				title: 'Расход, м. куб./час',
				titleFontSize,
				titleFontWeight: 700,
				gridColor: '#969ba5',
				gridThickness: 1,
				minimum: 0
			},
			axisY: {
				title: 'Напор/ NPSHr, м',
				titleFontSize,
				titleFontWeight: 700,
				gridColor: '#969ba5'
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
				titleFontSize,
				titleFontWeight: 700,
				gridColor: '#969ba5',
				gridThickness: 1,
				minimum: 0
			},
			axisY: {
				title: 'КПД, %',
				titleFontSize,
				titleFontWeight: 700,
				gridColor: '#969ba5'
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
				titleFontSize,
				titleFontWeight: 700,
				gridColor: '#969ba5',
				gridThickness: 1,
				minimum: 0
			},
			axisY: {
				title: 'Мощность, кВт',
				titleFontSize,
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
				toolTipContent: 'Расход запр.: {x} м3/ч, Напор запр: {y},м'
			},
			dpActual = {
				type: 'scatter',
				xValueFormatString: '#######.00',
				yValueFormatString: '#######.00',
				name: 'dp_actual',
				color: '#f05630',
				markerSize: 12.5,
				markerType: 'cross',
				dataPoints: [
					{
						x: $REAL_CALCULATED_DUTY_POINTS.q,
						y: $REAL_CALCULATED_DUTY_POINTS.h
					}
				],
				toolTipContent: 'Расход факт.: {x} м3/ч, Напор факт: {y},м'
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

		charts.forEach((chart, idx) => {
			//shadowCharts[idx].options = chart.options;

			shadowCharts[idx].options = JSON.parse(JSON.stringify(chart.options));
			shadowCharts[idx].options.animationEnabled = false;

			shadowCharts[idx].options.axisX.titleFontWeight =
				shadowCharts[idx].options.axisX.labelFontWeight =
				shadowCharts[idx].options.axisY.titleFontWeight =
				shadowCharts[idx].options.axisY.labelFontWeight =
					'lighter';

			shadowCharts[idx].options.axisX.titleFontSize =
				shadowCharts[idx].options.axisX.labelFontSize =
				shadowCharts[idx].options.axisY.titleFontSize =
				shadowCharts[idx].options.axisY.labelFontSize =
					20;

			chart.render();
			shadowCharts[idx].render();
		});
	}

	function destroyCharts() {
		charts.forEach((chart, idx) => {
			chart.destroy();
			shadowCharts[idx].destroy();
		});
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
		SELECTED_PUMP_MODEL_ID.set(id);

		await $CURRENT_STEP.actionHandler.addItemToHistory(id, 'get_pump_model_by_id');
		currentPumpModel = $SELECTION_STEPS[2].actionHandler.history[id];
		drawCharts();
	}

	//Перерисовываем морду, когда компонент смонтировался
	//и айди модели добавилась в историю
	$: $SELECTED_PUMP_MODEL_ID,
		(() => {
			if ($SELECTION_STEPS[2].actionHandler.history[$SELECTED_PUMP_MODEL_ID] && mounted) {
				currentPumpModel = $SELECTION_STEPS[2].actionHandler.history[$SELECTED_PUMP_MODEL_ID];
				drawCharts();
			}
		})();
</script>

<div {...$$restProps} class="scroll-snap-start pb-1" in:fly="{transitionIn}">
	<div class="row flex-row-gap-1">
		<SheetLabel text="{$SELECTION_STEPS[2].sheetLabel}" />

		<div class="col-sm-12">
			<strong class="fs-sm-md clr-blue-dark pos-r">Вам подойдут:</strong>
			<div class="w-100 pos-sticky bottom-left py-3">
				<RegionOverflow byX>
					{#each $SELECTION_STEPS[2].actionHandler.listOfItems as item}
						<Tooltip tipContent="{item.name}" showTipTimeout="{3000}">
							<button
								class="btn btn-sm rounded bg-clr-blue clr-white o-{Number(item.id) ===
								currentPumpModel.id
									? 1
									: '0-6'}"
								on:click="{() => selectPumpModel(item.id)}"
							>
								{chipModelName(item.name.replace('JETEX ', ''))}
							</button>
						</Tooltip>
					{/each}
				</RegionOverflow>
			</div>
		</div>

		<div class="col-sm-12 text-center">
			<h6 class="fs-md">{currentPumpModel.short_desc}</h6>
			<h4 class="fs-md-lg">{currentPumpModel.name}</h4>
		</div>

		<div class="col-md-6 sol-sm-12 d-flex flex-column flex-row-gap-{!$IS_MOBILE ? '0-5' : 1}">
			{#each $CHARTS_WRAPPER_ELEMS_IDS as wrapperId}
				<div class="w-100 h-{!$IS_MOBILE ? 30 : 50}-vh" id="{wrapperId}"></div>
			{/each}
		</div>
		<div class="col-md-6 col-sm-12 bg-clr-white-beige rounded-3 p-4">
			<div class="list-of-attributes fs-sm-md">
				<div class="col-1-span-3"
					><strong>Запрашиваемые параметры</strong>
					<img src="/assets/icons/circle.png" alt="circle" class="icon-tip" />
				</div>
				<div class="ps-2"><span>Расход</span></div>
				<div><strong>{$DUTY_POINTS.q} м<sup>3</sup>/ч</strong></div>
				<div class="ps-2"><span>Напор</span></div>
				<div><strong>{$DUTY_POINTS.h} м</strong></div>

				<div class="col-1-span-3"
					><strong>Фактические параметры</strong>
					<img src="/assets/icons/cross.png" alt="cross" class="icon-tip" /></div
				>
				{#each currentPumpModel.attributes.filter( (/** @type {Attribute} */ attr) => [1, 2, 12].includes(attr.attribute_id) ) as attr (attr.attribute_id)}
					<div class="ps-2"><span>{attr.name}</span></div>
					{#if attr.attribute_id === 1}
						<div><strong>{$REAL_CALCULATED_DUTY_POINTS.q} м<sup>3</sup>/ч</strong></div>
					{:else if attr.attribute_id === 2}
						<div><strong>{$REAL_CALCULATED_DUTY_POINTS.h} м</strong></div>
					{:else}
						<div><strong>{attr.value}</strong></div>
					{/if}
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

		<div class="com-md-12 w-100 shadow-charts-wrapper">
			{#each $SHADOWED_CHARTS_WRAPPER_ELEMS_IDS as wrapperId}
				<div class="_chart" id="{wrapperId}"></div>
			{/each}
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

	.shadow-charts-wrapper {
		position: fixed;
		visibility: hidden;
		z-index: -10000;
		pointer-events: none;

		._chart {
			width: 800px;
			height: 250px;
		}
	}

	.icon-tip {
		max-width: 15px;
		margin: 0 0 2.5px 5px;
	}
</style>
