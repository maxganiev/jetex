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
				max: 1.3
			},
			sql = `
			SELECT
    	pdp.pump_model_id AS id,
    	pm.name,
			ROUND(
    		CASE 
        	WHEN SUM(CASE WHEN pdp.q >= ${q} THEN 1 ELSE 0 END) > 0 THEN
           MIN(CASE WHEN pdp.q >= ${q} THEN pdp.q END)  
        	ELSE
           MAX(pdp.q) 
    			END,
			 	2) AS q_closest_to_requested,
				${q} AS q_requested,
				${h} AS h_requested
			FROM pump_duty_points pdp
			INNER JOIN pump_models pm ON pm.id = pdp.pump_model_id
			JOIN (
    	SELECT 
      pump_model_id,
      MIN(CASE 
            WHEN q >= ${q} THEN q - ${q} 
            ELSE ${q} - q + 1000000     
       		 END) as min_diff
    	FROM pump_duty_points
    	WHERE pump_model_id IN (
      SELECT pump_model_id 
      FROM pump_q_range
      WHERE pump_type_id IN (${pump_types})
      AND ${q} BETWEEN q_from AND q_to)
    	GROUP BY pump_model_id)
			closest ON pdp.pump_model_id = closest.pump_model_id 
    	AND (
      (pdp.q >= ${q} AND pdp.q - ${q} = closest.min_diff) OR
      (pdp.q < ${q} AND ${q} - pdp.q + 1000000 = closest.min_diff))
      AND pdp.h BETWEEN ${h} * ${allowanceRange.min} AND ${h} * ${allowanceRange.max}
			GROUP BY pdp.pump_model_id, pm.name
      ORDER BY MAX(pdp.h) DESC;`,
			pumpModelsByDutyPoint = await prisma.$queryRawUnsafe(sql);
		prisma.$disconnect;
		return responseSuccess(200, { pumpModelsByDutyPoint });
	} catch (/**@type {any} */ error) {
		prisma.$disconnect;
		return responseError(error);
	}
}
