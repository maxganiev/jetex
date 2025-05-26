export function getUnit(attributeItem) {
	const attrsIdsWithInbuiltUnitValues =
		[1, 2, 3].includes(attributeItem.attribute_id) && attributeItem.value.includes('м');

	return !attrsIdsWithInbuiltUnitValues &&
		attributeItem.value != '-' &&
		attributeItem.unit != undefined &&
		attributeItem.unit
		? ' ' + attributeItem.unit
		: '';
}
