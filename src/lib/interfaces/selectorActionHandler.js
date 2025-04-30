import { globals } from '$lib/globals';
import { SHADOWED_CHARTS_WRAPPER_ELEMS_IDS } from '$lib/stores/immutable';
import { SELECTION_STEPS, DUTY_POINTS, REAL_CALCULATED_DUTY_POINTS } from '$lib/stores/selectionProgress';
import { PumpType, PumpModel, Attribute } from '$lib/types';
import { ajax } from '$lib/utils/ajax';
import { Pdf } from './pdf';

class SelectorActionHandler {
	constructor() {
		/**@type {Object.<Number, PumpType | PumpModel> }} */
		this.history = {};

		/**@type {PumpType[] | PumpModel[]} */
		this.listOfItems = [];
	}

	get hasItems() {
		return this.listOfItems.length > 0;
	}
}

SelectorActionHandler.prototype.getListOfItems = async function (/**@type {String} */ url, /**@type {any} */ params) {
	const query = { url };
	if (params) query.params = params;

	const data = await ajax(query).getJSON();
	//console.log(data);
	this.listOfItems = data.body.pumpModelsByDutyPoint;
};

export class PumpTypeSelector extends SelectorActionHandler {
	constructor() {
		super();

		Object.preventExtensions(this);
	}

	async addItemToHistory(/**@type {Number[]}*/ ids, /**@type {String} */ url) {
		const newItems = ids.filter((id) => Object.keys(this.history).findIndex((key) => Number(key) == id) === -1);

		if (newItems.length === 0) return;

		const data = await ajax({ url, params: { ids: newItems.join(',') } }).getJSON();
		//console.log(data);

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
		this.pdfAction = new Pdf();

		Object.preventExtensions(this);
	}

	async addItemToHistory(/**@type {Number}*/ id, /**@type {String} */ url) {
		const newItemId = Object.keys(this.history).findIndex((key) => Number(key) === id);

		if (newItemId !== -1) return;

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
				'',
				this.listOfItems.find((item) => item.id === id)?.q_closest_to_requested || 0,
				-1
			);

		const unsubscribe = SELECTION_STEPS.subscribe((steps) => {
			const firstStep = steps[0];
			pm.setAttributes(firstStep.actionHandler.history[pm.pump_type_id].attributes, body.attrValues);
			pm.setShortDesc(firstStep.actionHandler.history[pm.pump_type_id].short_desc);
		});

		this.history[id] = pm;
		console.log('pump models selection history ', this.history);
		unsubscribe();

		if (data.body.attrValues.length === 0) return;
	}

	/**
	 * @param {any} options
	 */
	async printOffer(options) {
		function canvasToImgs() {
			/**
			 * *@type {String}
			 * @type {never[]}
			 */
			let imgs64Base = [];

			const _unsubscribe = SHADOWED_CHARTS_WRAPPER_ELEMS_IDS.subscribe((ids) => {
				imgs64Base = ids.map((/** @type {string} */ id) => {
					const canvas = document.getElementById(id).children[0].children[0];
					return canvas.toDataURL('image/jpeg', 1.0);
				});
			});

			_unsubscribe();
			return imgs64Base;
		}

		const style = `
		.container-main {
			width: 415pt;
			height: 620pt;
			border: 1px ${Pdf.colors['blue-dark']} solid;
			page-break-after: always;
			margin: 16px auto 0 auto;
		}

		.fluid {
			width: 100%;
			height: 100%;
			position: relative;
		}

		.table-wrapper {
			width: 100%;
			vertical-align: middle;
			padding: 10px;
		}

		td img, th img {
			display: block;
    	margin-left: auto;
    	margin-right: auto;
		}

		.table-border-collapse {
			border-collapse: collapse;
		}

		.table-bordered tr th,
		.table-bordered tr td {
			text-align: center;
			font-size: ${Pdf.fontSizes.sm};
			border: 1px ${Pdf.colors['blue-dark']} solid;
			padding: 5px;
		}

		.footer {
			position: absolute;
			bottom: 35px;
			left: 0;
			background: ${Pdf.colors['blue-dark']};
			font-size: ${Pdf.fontSizes.sm};
			height: 20px;
			width: 100%;
			z-index: 1;
		}

		.footer > table {
			font-size: ${Pdf.fontSizes.mid};
			color: ${Pdf.colors.white};
			width: 100%;
			height: 100%;
			text-align: center;
			vertical-align: middle;
		}
		`;

		const origin = Pdf.origin + globals.imagePath;

		/**@type {PumpModel} */
		let currentPumpModel = this.history[options.pump_model_id];
		/**@type {PumpType} */
		let currentPumpType;
		/**@type {Number} */
		let q, h, realQ, realH;

		//store subsribtions
		const unsubscribe = SELECTION_STEPS.subscribe((steps) => {
				const firstStep = steps[0];
				currentPumpType = firstStep.actionHandler.history[currentPumpModel.pump_type_id];
			}),
			unsubscribe2 = DUTY_POINTS.subscribe((dp) => {
				q = dp.q;
				h = dp.h;
			}),
			unsubscribe3 = REAL_CALCULATED_DUTY_POINTS.subscribe((dp) => {
				realQ = dp.q;
				realH = dp.h;
			});

		function tableHeader(/**@type {String}} */ h6) {
			return `
				<tr>
					<th><img src="${origin}logo_jetex.png" style="width: 60%; margin-left: 0;"/></th>
					<th style="color: ${Pdf.colors['blue-dark']}; text-align: center;">
					<h6 style="font-size: ${Pdf.fontSizes.mid};">${h6}</h6>
					<h3 style="font-size: ${Pdf.fontSizes.lg};">${currentPumpModel.name}</h3>
					</th>
				</tr>
		`;
		}

		const spacer = {
			hor: '<tr><td colspan="2" style="height: 10px; opacity: 0;"></td></tr>'
		};

		/**@type {Object<Number, Object>} */
		const styleFixesByPumpTypeIds = {
				1: { marginTop: -65, mainImgHeight: 200, attrGroupId: 4, drawingHeight: '35%' },
				2: { marginTop: -65, mainImgHeight: 200, attrGroupId: 4, drawingHeight: '35%' },
				3: { marginTop: -100, mainImgHeight: 250, attrGroupId: 5, drawingWidth: '95%' },
				4: { marginTop: 0, mainImgHeight: 150, attrGroupId: 5, drawingWidth: '75%' }
			},
			currStyleFix = styleFixesByPumpTypeIds[currentPumpModel.pump_type_id];

		const row1 = `
			<td>
				<p style="font-size: ${Pdf.fontSizes.sm}">${currentPumpType.description || 'Описание отсутствует'}</p>
			</td>
			<td>
				<img src="${origin + currentPumpType.images.find((image) => image.type_id === 1)?.img_url}" style="height: ${
			currStyleFix.mainImgHeight
		}px; margin-top: ${currStyleFix.marginTop}px;"/>
			</td>
		`;

		const row2 = `
			<td colspan="2">
				<table class="table-bordered table-border-collapse" style="width: 100%;">
					<thead>
						<tr>
							<th>${currentPumpModel.name}</th>
							<th>Запрашиваемые параметры</th>
							<th>Фактические параметры</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Расход Q, м<sup>3</sup>/ч.</td>
							<td>${q}</td>
							<td>${realQ}</td>
						</tr>
						<tr>
							<td>Напор, м.</td>
							<td>${h}</td>
							<td>${realH}</td>
						</tr>
					</tbody>
				</table>
			</td>
		`;

		const row3 = `
		<td colspan="2">
				<p style="font-size: ${Pdf.fontSizes.mid}; text-align: center; color: ${Pdf.colors['blue-dark']};">График подбора</p>
			${canvasToImgs()
				.map((src) => `<img src="${src}" style="width: 400px; height: 125px;"/>`)
				.join('')}
		</td>
		`;

		/**@type {Attribute[]} */
		const sizeAttributes = currentPumpModel.attributes
				.filter((/**@type {Attribute}*/ item) => item.group_id === 11)
				.sort((/** @type {{ sort_order: Number; }} */ a, /** @type {{ sort_order: Number; }} */ b) =>
					a.sort_order < b.sort_order ? -1 : 1
				),
			pumpWeightNetto = currentPumpModel.attributes.find(
				(/** @type {{ attribute_id: Number; }} */ item) => item.attribute_id === 18
			).value;

		const row4 = `
			<table class="table-bordered table-border-collapse" style="width: 100%;">
					<tr>
						<th rowspan="2">Насос</th>
						<th colspan="${sizeAttributes.length}">Размеры, мм</th>
						<th rowspan="2">Масса, кг</th>
					</tr>
					<tr>
						${sizeAttributes.map((item) => `<td>${item.name}</td>`).join('')}
					</tr>
							<tr>
								<td>${currentPumpModel.name}</td>
								${sizeAttributes.map((item) => `<td>${item.value}</td>`).join('')}
								<td>${pumpWeightNetto}</td>
					</tr>
			</table>		
		`;

		//группировка всех атрибутов, кроме Размеров (id=11), по группам
		//кчюч - айди группы
		const groupedAttributes = currentPumpModel.attributes.reduce((acc, curr, idx, array) => {
			const currGrpAttrs = array.filter((item) => item.group_id === curr.group_id);

			return curr.group_id === 11
				? acc
				: Object.assign(acc, {
						[curr.group_id]: {
							name: currGrpAttrs[0].group_name,
							attributes: currGrpAttrs,
							length: currGrpAttrs.length + 1
						}
				  });
		}, {});

		//console.log(groupedAttributes);

		/**@type {Object.<Number | String,Object>} */
		let groupedAttributesStart = {},
			/**@type {Object.<Number | String,Object>} */
			groupedAttributesEnd = {};

		Object.keys(groupedAttributes).forEach((key) => {
			if (Number(key) < currStyleFix.attrGroupId) groupedAttributesStart[key] = groupedAttributes[key];
			else groupedAttributesEnd[key] = groupedAttributes[key];
		});

		function attrsRow(obj) {
			return `<table class="table-bordered table-border-collapse" style="width: 100%;">
				<tr>
					<th>Наименование</th>
					<th>Свойства</th>
					<th>Значения</th>
				</tr>

				   ${Object.keys(obj)
						.map(
							(key) => `
							<tr>
								<td rowspan="${groupedAttributes[key].length}">${groupedAttributes[key].name}</td>
									${groupedAttributes[key].attributes
										.map(
											(item) => `
																<tr>
						 											<td>${item.name}</td>
						 											<td>${item.value}</td>
																</tr>`
										)
										.join('')}
							</tr>
						`
						)
						.join('')}
			</table>
		`;
		}

		const row5 = attrsRow(groupedAttributesStart),
			row6 = attrsRow(groupedAttributesEnd);

		/**
		 * @param {String} content

		 */
		function page(content) {
			return `
			<div class="container-main">
				<div class="fluid">
				${content}
					<div class="footer">
						<table>
							<tbody>
								<tr>
									<td>www.jetexpumps.ru</td>
									<td>+7(812)309 97 99</td>
									<td>e-mail:sales@jetexpumps.ru</td>
								</tr>
							</tbody>
						</table>
					</div
				</div>
			</div>
		`;
		}

		const html = `
				${page(
					`<table class="table-wrapper">
		  			<colgroup>
       				<col span="1" style="width: 50%;">
       				<col span="1" style="width: 50%;">
    				</colgroup>
						<thead>${tableHeader('Лист данных на насос')}</thead>
						<tbody>
							<tr>${row1}</tr>
							${spacer.hor}
							<tr>${row2}</tr>
							${spacer.hor}
							<tr>${row3}</tr>
						</tbody>
					</table>`
				)}
				${page(
					`<table class="table-wrapper">
						<colgroup>
						 <col span="1" style="width: 50%;">
						 <col span="1" style="width: 50%;">
					</colgroup>
					<thead>${tableHeader('Технические характеристики')}</thead>
					</table>
					<div style="padding: 10px";>
						${row4}
						<img src="${
							origin + currentPumpModel.images.find((image) => image.type_id === 2)?.img_url
						}" style="margin: 25px auto; width: ${
						currStyleFix.drawingWidth || 'auto'
					}; height: ${currStyleFix.drawingHeight || 'auto'}; display: block;"/>
						${row5}
					</div>
					`
				)}
					${page(
						`<table class="table-wrapper">
							<colgroup>
						 		<col span="1" style="width: 50%;">
						 		<col span="1" style="width: 50%;">
								</colgroup>
							<thead>${tableHeader('Технические характеристики')}</thead>
							</table>
						<div style="padding: 10px";>
							${row6}
					</div>
					`
					)}
		`;

		this.pdfAction.setStyle(style);
		this.pdfAction.setHtml(html);
		await this.pdfAction.printContent();

		unsubscribe();
		unsubscribe2();
		unsubscribe3();
	}
}
