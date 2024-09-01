async function getPumpModelByDutyPoint(
	/** @type {import('@prisma/client').PrismaClient}*/ prisma,
	/**@type {Object & {pump_type_id: Number, q: Number, h: Number}} */ query
) {
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
    WHERE pump_models.pump_type_id = ${query.pump_type_id}
    AND ${query.h} >= (pump_duty_points.h * ${allowanceRange.min})
    AND ${query.h} <= (pump_duty_points.h * ${allowanceRange.max})
    AND ${query.q} <= (pump_duty_points.q * ${allowanceRange.min})
    AND ${query.q} <= (pump_duty_points.q * ${allowanceRange.max})
    GROUP BY pump_models.id;`,
		pumpModelsByDutyPoint = await prisma.$queryRawUnsafe(sql);

	console.dir(pumpModelsByDutyPoint, { depth: null, colors: true });
	return pumpModelsByDutyPoint;
}

export default getPumpModelByDutyPoint;
