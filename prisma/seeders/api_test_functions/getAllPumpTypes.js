async function getAllPumpTypes(/** @type {import('@prisma/client').PrismaClient}*/ prisma) {
	const pump_types = await prisma.pump_types
		.findMany({ include: { images: true } })
		.then((p) => p.map((p) => Object.assign({}, { ...p, images: p.images[0] })));

	console.dir(pump_types, { depth: null, colors: true });
	return pump_types;
}

export default getAllPumpTypes;
