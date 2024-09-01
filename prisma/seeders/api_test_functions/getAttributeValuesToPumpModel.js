async function getAttributeValuesToPumpModel(
	/** @type {import('@prisma/client').PrismaClient}*/ prisma,
	/**@type {Number} */ pump_model_id
) {
	const attributeValuesToPumpModel = await prisma.attribute_values_to_pump_models.findMany({
		select: { attribute_id: true, value: true },
		where: { pump_model_id }
	});

	console.dir(attributeValuesToPumpModel, { depth: null, colors: true });
	return attributeValuesToPumpModel;
}

export default getAttributeValuesToPumpModel;
