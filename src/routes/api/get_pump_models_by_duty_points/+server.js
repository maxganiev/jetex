import { prisma } from '$lib/prisma';
import { responseError } from '$lib/api_responses/responseError';
import { responseSuccess } from '$lib/api_responses/responseSuccess';

/** @type {import('./$types').RequestHandler} */

export async function GET({ request, url }) {
	try {
		const q = url.searchParams.get('q'),
			h = url.searchParams.get('h'),
			pump_types = url.searchParams.get('pump_types');

		if (!q || !h || !pump_types) return responseError('get_pump_models_by_duty_points method failed');

		const allowanceRange = {
				min: 0.95,
				max: 1.1
			},
			sql = `SELECT
    pump_models.id,
    pump_models.name
    FROM pump_models
    INNER JOIN pump_duty_points
    ON pump_models.id = pump_duty_points.pump_model_id
    WHERE pump_models.pump_type_id IN (${pump_types})
    AND ${h} >= (pump_duty_points.h * ${allowanceRange.min})
    AND ${h} <= (pump_duty_points.h * ${allowanceRange.max})
    AND ${q} >= (pump_duty_points.q * ${allowanceRange.min})
    AND ${q} <= (pump_duty_points.q * ${allowanceRange.max})
    GROUP BY pump_models.id;`,
			pumpModelsByDutyPoint = await prisma.$queryRawUnsafe(sql);

		prisma.$disconnect;
		return responseSuccess(200, { pumpModelsByDutyPoint });
	} catch (/**@type {any} */ error) {
		prisma.$disconnect;
		return responseError(error);
	}
}
