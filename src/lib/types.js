import { globals } from './globals';
export const /**@type {Number[]} */ arrayNumber = [];

class Image {
	constructor(
		/**@type {Number} */ id = -1,
		/**@type {Number} */ type_id = 1,
		/**@type {String} */ img_url = globals.imagePath + 'logo_jetex.png'
	) {
		this.id = id;
		this.type_id = type_id;
		this.img_url = img_url;

		Object.preventExtensions(this);
	}
}

export class Attribute {
	/**
	 * @param {Number} attribute_id
	 * @param {Number} group_id
	 * @param {String} group_name
	 * @param {String} name
	 * @param {Number} pump_type_id
	 * @param {String} unit
	 * @param {Number} sort_order,
	 * @param {Number} group_sort_order,
	 *  @param {String | undefined} value
	 */
	constructor(attribute_id, group_id, group_name, name, pump_type_id, unit, sort_order, group_sort_order, value) {
		this.attribute_id = attribute_id;
		this.group_id = group_id;
		this.group_name = group_name;
		this.name = name;
		this.pump_type_id = pump_type_id;
		this.unit = unit;
		this.sort_order = sort_order;
		this.group_sort_order = group_sort_order;
		this.value = value;

		Object.preventExtensions(this);
	}
}

export class PumpType {
	constructor(
		/**@type {Number} */ id,
		/**@type {String} */ name,
		/**@type {String | null} */ description,
		/**@type {Image[]} */ images,
		/**@type {Object.<Number, Attribute>} */ attributes,
		/**@type {String} */ short_desc
	) {
		this.id = id;
		this.name = name;
		this.description = description;
		this.images = images.map((img) => new Image(img.id, img.type_id, img.img_url));
		this.attributes = attributes.reduce(
			(
				/**@type {Object.<Number, Attribute>} */
				acc,
				/** @type {{ attribute: Object.<String, String>; pump_type_id: Number; }} */ attr
			) => {
				const attribute = attr.attribute,
					{ attribute_id, group_id, group, name, unit, sort_order } = attribute;

				return Object.assign(acc, {
					[attribute_id]: new Attribute(
						attribute_id,
						group_id,
						group.name,
						name,
						attr.pump_type_id,
						unit,
						sort_order,
						group.sort_order,
						undefined
					)
				});
			},
			{}
		);

		this.short_desc = short_desc;

		Object.preventExtensions(this);
	}
}

export class DutyPoint {
	constructor(
		/**@type {Number} */ id,
		/**@type {Number} */ pump_model_id,
		/**@type {Number} */ q,
		/**@type {Number} */ h,
		/**@type {Number} */ eff,
		/**@type {Number} */ p,
		/**@type {Number} */ npsh
	) {
		this.id = id;
		this.pump_model_id = pump_model_id;
		this.q = q;
		this.h = h;
		this.eff = eff;
		this.p = p;
		this.npsh = npsh;

		Object.preventExtensions(this);
	}
}

export class PumpModel {
	constructor(
		/**@type {Number} */ id,
		/**@type {String} */ name,
		/**@type {Number} */ pump_type_id,
		/**@type {DutyPoint[]} */ pump_duty_points,
		/**@type {Image[]} */ images,
		/**@type {Object.<Number, Object>} */ attributes,
		/**@type {String} */ short_desc,
		/**@type {Number} */ q_closest_to_requested
	) {
		this.id = id;
		this.name = name;
		this.pump_type_id = pump_type_id;
		this.pump_duty_points = pump_duty_points;
		this.images = images.map((img) => new Image(img.id, img.type_id, img.img_url));
		this.attributes = attributes;
		this.short_desc = short_desc;
		this.q_closest_to_requested = q_closest_to_requested;

		Object.preventExtensions(this);
	}

	setAttributes(
		/**@type {Object.<Number, Attribute>} */ attributesToPumpType,
		/**@type {Object.<Number, Attribute>} */ attributesValuesToPumpModel
	) {
		this.attributes = Object.keys(attributesToPumpType).reduce(
			(/**@type {Object[]}*/ acc, key) => [
				...acc,
				Object.assign({}, { ...attributesToPumpType[key], value: attributesValuesToPumpModel[key] })
			],
			[]
		);
	}

	setShortDesc(/**@type {String} */ pumpTypeShortDesc) {
		this.short_desc = pumpTypeShortDesc;
	}
}
