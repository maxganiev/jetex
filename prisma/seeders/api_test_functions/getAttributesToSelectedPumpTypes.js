async function getAttributesToSelectedPumpTypes(
	/** @type {import('@prisma/client').PrismaClient}*/ prisma,
	/**@type {Number[]} */ pump_type_ids
) {
	const selectedPumpTypeAttributes = await prisma.attributes_to_pump_types.findMany({
		where: { pump_type_id: { in: pump_type_ids } },
		include: {
			attribute: {
				include: { group: { select: { name: true, sort_order: true } } }
			}
		}
	});

	console.dir(selectedPumpTypeAttributes, { depth: null, colors: true });

	return selectedPumpTypeAttributes;
}

export default getAttributesToSelectedPumpTypes;
