<script>
	import GutterXY from './Gutters/GutterXY.svelte';
	import {
		SELECTED_PUMP_TYPE_IDS,
		SELECTED_PUMP_MODEL_ID,
		SELECTION_STEPS,
		CURRENT_STEP_IDX,
		CURRENT_STEP,
		DUTY_POINTS
	} from '$lib/stores/selectionProgress';
	import Icon from '@iconify/svelte';
	import { ALERT, IS_MOBILE, SHOW_LOADER } from '$lib/stores/ui';
	import { onMount } from 'svelte';

	onMount(() => {
		window.addEventListener('keydown', onEnterKeyDown);

		return () => window.removeEventListener('keydown', onEnterKeyDown);
	});

	function onEnterKeyDown(/**@type {KeyboardEvent}*/ e) {
		if (!e || !e.key || e.key !== 'Enter' || !$CURRENT_STEP.enabled || $SHOW_LOADER || $ALERT.show) return;
		onSelectionProgress();
	}

	async function onSelectionProgress() {
		//Выбираем насосы
		if ($CURRENT_STEP.id === 1)
			await $CURRENT_STEP.actionHandler.addItemToHistory($SELECTED_PUMP_TYPE_IDS, 'get_pump_types_attrs');

		//Подбираем модели по РД
		if ($CURRENT_STEP.id === 2) {
			await $CURRENT_STEP.actionHandler.getListOfItems('get_pump_models_by_duty_points_new', {
				q: $DUTY_POINTS.q,
				h: $DUTY_POINTS.h,
				pump_types: $SELECTED_PUMP_TYPE_IDS.join(',')
			});

			//Если модели найдены - втыкаем первую попавшуюся в выбранные и в историю
			//и продолжаем подбор
			if ($CURRENT_STEP.actionHandler.hasItems) {
				SELECTED_PUMP_MODEL_ID.set($CURRENT_STEP.actionHandler.listOfItems[0].id);
				await $CURRENT_STEP.actionHandler.addItemToHistory(
					$SELECTED_PUMP_MODEL_ID,
					'get_pump_model_by_id'
				);
			}
			//Если ничего не найдено - остаемся на предыдущем шаге и выводим алерт
			else {
				SELECTED_PUMP_MODEL_ID.set(undefined);
				ALERT.update((al) => {
					al.type = 'warning';
					al.show = true;
					al.msg = 'Ничего не нашлось. Попробуйте скорректировать запрос.';

					return al;
				});
				return;
			}
		}

		//Выводим на ТКП
		if ($CURRENT_STEP.id === 3)
			await $CURRENT_STEP.actionHandler.printOffer({ pump_model_id: $SELECTED_PUMP_MODEL_ID });

		if ($CURRENT_STEP_IDX === $SELECTION_STEPS.length - 1) return;
		CURRENT_STEP_IDX.update((idx) => {
			idx++;
			return idx;
		});
	}

	function setCurrentStepIdx(/**@type {Number}*/ stepIdx) {
		CURRENT_STEP_IDX.set(stepIdx);
	}

	function selectionStepFwd() {
		if ($CURRENT_STEP_IDX === $SELECTION_STEPS.length - 1) return;
		CURRENT_STEP_IDX.update((idx) => {
			idx++;
			return idx;
		});
	}

	function selectionStepBwd() {
		if ($CURRENT_STEP_IDX === 0) return;
		CURRENT_STEP_IDX.update((idx) => {
			idx--;
			return idx;
		});
	}
</script>

<footer class="bg-clr-gray-light pos-sticky bottom-left w-100 z-1">
	<GutterXY>
		{#if !$IS_MOBILE}
			<!--Desktop-->
			<div class="row align-items-end flex-row-gap-1">
				{#each $SELECTION_STEPS as step, idx (step.id)}
					<div
						class="col-xl-1 col-lg-2 col-md-2 col-sm-12 align-items-center d-flex text-center flex-column-reverse"
					>
						<button
							class="btn rounded-circle bg-clr-blue-dark clr-white ratio-1x1 mt-2 o-{step.enabled
								? 1
								: '0-6'}"
							style="min-width: 42px;"
							disabled="{!$SELECTION_STEPS[idx].enabled}"
							on:click="{() => setCurrentStepIdx(idx)}"
						>
							{#if $CURRENT_STEP.id > step.id}
								<Icon icon="material-symbols:done" style="color: #fff" />
							{:else}
								<span> {step.id} </span>
							{/if}
						</button>
						<label class="fs-sm-md clr-blue-dark" for="">{step.type}</label>
					</div>
				{/each}

				<div class="col-md-4 col-sm-12 d-flex ms-auto">
					<button
						class="btn w-100 rounded-3 bg-clr-blue-dark clr-white fs-sm-md {$CURRENT_STEP.buttonLabel
							? 'visible'
							: 'invisible'}"
						disabled="{!$CURRENT_STEP.enabled || $SHOW_LOADER || $ALERT.show}"
						on:click="{onSelectionProgress}"
					>
						{$CURRENT_STEP.buttonLabel}
					</button>
				</div>
			</div>
		{:else}
			<!--Mobile-->
			<div class="d-flex flex-column-gap-1 my-3 mx-0">
				<button
					class="btn rounded-circle bg-clr-blue-dark border-0 p-0"
					style="width: 2em; height: 2em;"
					disabled="{$CURRENT_STEP_IDX === 0}"
					on:click="{selectionStepBwd}"
				>
					<Icon icon="mdi:chevron-left" style="color: #fff" width="2em" height="2em" />
				</button>
				<button
					class="btn rounded-3 bg-clr-blue-dark clr-white flex-grow-1 fs-sm-md {$CURRENT_STEP.buttonLabel
						? 'visible'
						: 'invisible'}"
					disabled="{!$CURRENT_STEP.enabled || $SHOW_LOADER || $ALERT.show}"
					on:click="{onSelectionProgress}"
				>
					{$CURRENT_STEP.buttonLabel}
				</button>
				<button
					class="btn rounded-circle bg-clr-blue-dark border-0 p-0"
					style="width: 2em; height: 2em;"
					disabled="{$CURRENT_STEP_IDX === $SELECTION_STEPS.length - 1 ||
						!$SELECTION_STEPS[$CURRENT_STEP_IDX + 1].enabled}"
					on:click="{selectionStepFwd}"
				>
					<Icon icon="mdi:chevron-right" style="color: #fff" width="2em" height="2em" />
				</button>
			</div>
		{/if}
	</GutterXY>
</footer>
