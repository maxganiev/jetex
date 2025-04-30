import { PrismaClient } from '@prisma/client';
import { calcPolynomialRegression } from '../src/lib/utils/calcPolynomialRegression.js';
import { findClosestNumber } from '../src/lib/utils/findClosestNumber.js';
import log from './log.js';

const prisma = new PrismaClient();

const xValues = [0, 1.429, 2.857, 4.286, 5.714, 7.143, 8.571, 10, 11.43, 12.86, 14.29, 15.71, 17.14, 18.57, 20],
	yValues = [
		57.98, 57.18, 56.51, 55.89, 55.29, 54.64, 53.9, 53.01, 51.91, 50.56, 48.89, 46.86, 44.41, 41.48, 38.04
	];

const dp = [
	{
		id: 1651,
		pump_model_id: 73,
		q: 0.1,
		h: 56,
		eff: 0.1,
		p: 0.5807,
		npsh: 0.2178
	},
	{
		id: 1652,
		pump_model_id: 73,
		q: 0.7857,
		h: 56.12,
		eff: 12.47,
		p: 0.7284,
		npsh: 0.334
	},
	{
		id: 1653,
		pump_model_id: 73,
		q: 1.571,
		h: 55.93,
		eff: 23.21,
		p: 0.8641,
		npsh: 0.4111
	},
	{
		id: 1654,
		pump_model_id: 73,
		q: 2.357,
		h: 55.46,
		eff: 32.36,
		p: 0.9884,
		npsh: 0.4582
	},
	{
		id: 1655,
		pump_model_id: 73,
		q: 3.143,
		h: 54.72,
		eff: 40.02,
		p: 1.102,
		npsh: 0.4842
	},
	{
		id: 1656,
		pump_model_id: 73,
		q: 3.929,
		h: 53.73,
		eff: 46.32,
		p: 1.205,
		npsh: 0.4981
	},
	{
		id: 1657,
		pump_model_id: 73,
		q: 4.714,
		h: 52.5,
		eff: 51.39,
		p: 1.298,
		npsh: 0.509
	},
	{
		id: 1658,
		pump_model_id: 73,
		q: 5.5,
		h: 51.06,
		eff: 55.35,
		p: 1.381,
		npsh: 0.5258
	},
	{
		id: 1659,
		pump_model_id: 73,
		q: 6.286,
		h: 49.41,
		eff: 58.32,
		p: 1.456,
		npsh: 0.5575
	},
	{
		id: 1660,
		pump_model_id: 73,
		q: 7.071,
		h: 47.58,
		eff: 60.42,
		p: 1.522,
		npsh: 0.6131
	},
	{
		id: 1661,
		pump_model_id: 73,
		q: 7.857,
		h: 45.58,
		eff: 61.77,
		p: 1.581,
		npsh: 0.7017
	},
	{
		id: 1662,
		pump_model_id: 73,
		q: 8.643,
		h: 43.43,
		eff: 62.5,
		p: 1.632,
		npsh: 0.8322
	},
	{
		id: 1663,
		pump_model_id: 73,
		q: 9.429,
		h: 41.14,
		eff: 62.73,
		p: 1.676,
		npsh: 1.014
	},
	{
		id: 1664,
		pump_model_id: 73,
		q: 10.21,
		h: 38.73,
		eff: 62.58,
		p: 1.714,
		npsh: 1.255
	},
	{
		id: 1665,
		pump_model_id: 73,
		q: 11,
		h: 36.22,
		eff: 62.18,
		p: 1.746,
		npsh: 1.565
	}
];

// console.log(
// 	calcPolynomialRegression(
// 		10,
// 		dp.map((n) => n.q),
// 		dp.map((n) => n.h)
// 	).cubicPolynomial
// );

// console.log(
// 	findClosestNumber(
// 		10,
// 		dp.map((n) => n.q)
// 	)
// );

async function get() {
	try {
		const q = 12,
			h = 48,
			pump_types = 1;

		if (!q || !h || !pump_types) return;

		const allowanceRange = {
				min: 0.95,
				max: 1.2
			},
			sql = `SELECT
							pdp.pump_model_id,
							pdp.q AS q_closest,
							pm.name
							FROM pump_duty_points pdp
							INNER JOIN pump_models pm 
							ON pm.id = pdp.pump_model_id
							JOIN (
    					SELECT pump_model_id, MIN(ABS(q - ${q})) as min_diff
    					FROM pump_duty_points
    					WHERE pump_model_id IN (
        			SELECT pump_model_id 
        			FROM pump_q_range
        			WHERE pump_type_id IN (${pump_types})
        			AND ${q} BETWEEN q_from AND q_to)
    					GROUP BY pump_model_id)
							closest ON pdp.pump_model_id = closest.pump_model_id 
          		AND ABS(pdp.q - ${q}) = closest.min_diff
          		AND pdp.h BETWEEN ${h} * ${allowanceRange.min} AND ${h} * ${allowanceRange.max}
							ORDER BY pdp.h DESC;`,
			pumpModelsByDutyPoint = await prisma.$queryRawUnsafe(sql);
		prisma.$disconnect;
		log(pumpModelsByDutyPoint);
	} catch (/**@type {any} */ error) {
		prisma.$disconnect;
		log(error);
	}
}

get();
