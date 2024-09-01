import { prisma } from '$lib/prisma';

async function getPumpTypes() {
	return await prisma.pump_types.findMany({
		include: { images: { where: { type_id: 1 }, select: { img_url: true } } }
	});
}

export async function load({ url }) {
	try {
		const pumpTypes = await getPumpTypes();
		await prisma.$disconnect();
		return { pumpTypes };
	} catch (error) {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	}
}
