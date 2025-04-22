import { prisma } from '$lib/prisma';
import { responseError } from '$lib/api_responses/responseError';
import { responseSuccess } from '$lib/api_responses/responseSuccess';

/** @type {import('./$types').RequestHandler} */

export async function GET({ request, url }) {
	try {
		const q = url.searchParams.get('q'),
			h = url.searchParams.get('h'),
			pump_types = url.searchParams.get('pump_types');

		if (!q || !h || !pump_types) return responseError('get_pump_models_by_duty_points_new method failed');

		const allowanceRange = {
				min: 0.95,
				max: 1.2
			},
			sql = `SELECT pm.id, pm.name
			FROM pump_models pm
			WHERE pm.id IN (
			SELECT DISTINCT pdp.pump_model_id
			FROM pump_duty_points pdp
			WHERE pdp.pump_model_id IN (
			SELECT pqr.pump_model_id
			FROM pump_q_range pqr
			WHERE pqr.pump_type_id IN (${pump_types})
			AND ${q} BETWEEN pqr.q_from AND pqr.q_to)
			AND pdp.h BETWEEN ${h} * ${allowanceRange.min} AND ${h} * ${allowanceRange.max}
			)`,
			pumpModelsByDutyPoint = await prisma.$queryRawUnsafe(sql);
		prisma.$disconnect;
		return responseSuccess(200, { pumpModelsByDutyPoint });
	} catch (/**@type {any} */ error) {
		prisma.$disconnect;
		return responseError(error);
	}
}
