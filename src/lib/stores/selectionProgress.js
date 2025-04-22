import { PumpTypeSelector, PumpModelSelector } from '$lib/interfaces/selectorActionHandler';
import { arrayNumber } from '$lib/types';
import { writable, derived } from 'svelte/store';

const pumpTypeSelector = new PumpTypeSelector(),
	pumpModelSelector = new PumpModelSelector();

const selSteps = [
	{
		id: 1,
		type: 'Тип',
		enabled: true,
		sheetLabel: 'Типы насосов',
		actionHandler: pumpTypeSelector,
		buttonLabel: 'Параметры'
	},

	{
		id: 2,
		type: 'Параметры',
		enabled: false,
		sheetLabel: 'Входные данные',
		actionHandler: pumpModelSelector,
		buttonLabel: 'Подобрать'
	},

	{
		id: 3,
		type: 'Выбор модели',
		enabled: false,
		sheetLabel: 'Выбор модели',
		actionHandler: pumpModelSelector,
		buttonLabel: 'Вывести ТКП'
	}
];

export const SELECTED_PUMP_TYPE_IDS = writable([...arrayNumber]),
	DUTY_POINTS = writable({ q: undefined, h: undefined }),
	REAL_CALCULATED_DUTY_POINTS = writable({ q: 0, h: 0 }),
	SELECTED_PUMP_MODEL_ID = writable(undefined),
	SELECTION_STEPS = derived(
		[SELECTED_PUMP_TYPE_IDS, DUTY_POINTS, SELECTED_PUMP_MODEL_ID],
		([$SELECTED_PUMP_TYPE_IDS, $DUTY_POINTS, $SELECTED_PUMP_MODEL_ID], set) => {
			selSteps[0].enabled = $SELECTED_PUMP_TYPE_IDS.length > 0;

			selSteps[1].enabled =
				selSteps[0].enabled &&
				Object.keys($DUTY_POINTS).every((key) => (key == 'q' || key == 'h') && $DUTY_POINTS[key]);

			selSteps[2].enabled =
				selSteps[0].enabled && selSteps[1].enabled && $SELECTED_PUMP_MODEL_ID != undefined;

			set(selSteps);
		}
	),
	CURRENT_STEP_IDX = writable(0),
	CURRENT_STEP = derived([SELECTION_STEPS, CURRENT_STEP_IDX], ([$SELECTION_STEPS, $CURRENT_STEP_IDX], set) => {
		set($SELECTION_STEPS[$CURRENT_STEP_IDX]);
	});
