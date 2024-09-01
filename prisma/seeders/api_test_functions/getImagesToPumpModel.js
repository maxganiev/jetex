async function getImagesToPumpModel(
	/** @type {import('@prisma/client').PrismaClient}*/ prisma,
	/**@type {Number} */ pump_model_id
) {
	const imagesToPumpModel = await prisma.images_to_pump_models.findMany({
		where: { pump_model_id }
	});

	console.dir(imagesToPumpModel, { depth: null, colors: true });
	return imagesToPumpModel;
}

export default getImagesToPumpModel;
