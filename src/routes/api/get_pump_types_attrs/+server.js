import { prisma } from '$lib/prisma';
import { responseError } from '$lib/api_responses/responseError';
import { responseSuccess } from '$lib/api_responses/responseSuccess';

function getPumpTypesByIds(/**@type {Number[] } */ pump_type_ids) {
	return prisma.pump_types.findMany({ where: { id: { in: pump_type_ids } }, include: { images: true } });
}

function getAttributesToSelectedPumpTypes(/**@type {Number[] } */ pump_type_ids) {
	return prisma.attributes_to_pump_types.findMany({
		where: { pump_type_id: { in: pump_type_ids } },
		include: {
			attribute: {
				include: { group: { select: { name: true, sort_order: true } } }
			}
		}
	});
}

/** @type {import('./$types').RequestHandler} */

export async function GET({ request, url }) {
	try {
		let query = url.searchParams.get('ids');
		if (!query) return responseError('get_pump_types_attrs method failed');

		const ids = query.split(',').map((p) => Number(p));
		const [pumpTypes, pumpAttrs] = await prisma.$transaction([
			getPumpTypesByIds(ids),
			getAttributesToSelectedPumpTypes(ids)
		]);

		prisma.$disconnect;
		return responseSuccess(200, { pumpTypes, pumpAttrs });
	} catch (error) {
		prisma.$disconnect;
		return responseError('get_pump_types_attrs method failed');
	}
}
