import { SELECTION_STEPS } from '$lib/stores/selectionProgress';
import { SHOW_LOADER } from '$lib/stores/ui';
import { PumpType, PumpModel } from '$lib/types';
import { ajax } from '$lib/utils/ajax';

class SelectorActionHandler {
	constructor() {
		/**@type {Object.<Number, PumpType | PumpModel> }} */
		this.history = {};

		/**@type {PumpType[] | PumpModel[]} */
		this.listOfItems = [];

		Object.preventExtensions(this);
	}

	get hasItems() {
		return this.listOfItems.length > 0;
	}
}

SelectorActionHandler.prototype.getListOfItems = async function (/**@type {String} */ url, /**@type {any} */ params) {
	SHOW_LOADER.set(true);
	const query = { url };
	if (params) query.params = params;

	const data = await ajax(query).getJSON();
	//console.log(data);
	this.listOfItems = data.body.pumpModelsByDutyPoint;

	SHOW_LOADER.set(false);
};

export class PumpTypeSelector extends SelectorActionHandler {
	constructor() {
		super();
	}

	async addItemToHistory(/**@type {Number[]}*/ ids, /**@type {String} */ url) {
		const newItems = ids.filter((id) => Object.keys(this.history).findIndex((key) => Number(key) == id) === -1);

		if (newItems.length === 0) return;

		SHOW_LOADER.set(true);
		const data = await ajax({ url, params: { ids: newItems.join(',') } }).getJSON();
		//console.log(data);
		SHOW_LOADER.set(false);

		if (data.body.pumpTypes.length === 0 || data.body.pumpAttrs.length === 0) return;

		data.body.pumpTypes.forEach(
			(
				/** @type {{ id: Number; name: String; description: String | null; images: []; short_desc: String}} */ pt
			) => {
				const pumpType = new PumpType(
					pt.id,
					pt.name,
					pt.description,
					pt.images,
					data.body.pumpAttrs.filter((/** @type {any }} */ attr) => attr.pump_type_id === pt.id),
					pt.short_desc
				);

				this.history[pt.id] = pumpType;
			}
		);

		console.log('pump types selection history ', this.history);
	}
}

export class PumpModelSelector extends SelectorActionHandler {
	constructor() {
		super();
	}

	async addItemToHistory(/**@type {Number}*/ id, /**@type {String} */ url) {
		const newItemId = Object.keys(this.history).findIndex((key) => Number(key) === id);

		if (newItemId !== -1) return;
		SHOW_LOADER.set(true);
		const data = await ajax({ url, params: { id } }).getJSON();
		//console.log(data);

		const { body } = data,
			pm = new PumpModel(
				id,
				body.pumpModel.name,
				body.pumpModel.pump_type_id,
				body.dutyPoints,
				body.images,
				[],
				''
			);

		SELECTION_STEPS.subscribe((steps) => {
			const firstStep = steps[0];
			pm.setAttributes(firstStep.actionHandler.history[pm.pump_type_id].attributes, body.attrValues);
			pm.setShortDesc(firstStep.actionHandler.history[pm.pump_type_id].short_desc);
		});

		this.history[id] = pm;
		console.log('pump models selection history ', this.history);

		if (data.body.attrValues.length === 0) return;
		SHOW_LOADER.set(false);
	}

	async printOffer() {
		console.log('Выводим ТКП');
	}
}
