import { prisma } from '$lib/prisma';
import { responseError } from '$lib/api_responses/responseError';
import { responseSuccess } from '$lib/api_responses/responseSuccess';

function getPumpModel(/**@type {Number} */ pump_model_id) {
	return prisma.pump_models.findFirst({ where: { id: pump_model_id } });
}

function getImagesToPumpModel(/**@type {Number} */ pump_model_id) {
	return prisma.images_to_pump_models.findMany({
		where: { pump_model_id }
	});
}

function getAttributeValuesToPumpModel(/**@type {Number} */ pump_model_id) {
	return prisma.attribute_values_to_pump_models.findMany({
		select: { attribute_id: true, value: true },
		where: { pump_model_id }
	});
}

function getDutyPointsToPumpModel(/**@type {Number} */ pump_model_id) {
	return prisma.pump_duty_points.findMany({
		where: { pump_model_id }
	});
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ request, url }) {
	try {
		const pump_model_id = Number(url.searchParams.get('id'));

		const [pumpModel, images, attrValuesArray, dutyPoints] = await prisma.$transaction([
			getPumpModel(pump_model_id),
			getImagesToPumpModel(pump_model_id),
			getAttributeValuesToPumpModel(pump_model_id),
			getDutyPointsToPumpModel(pump_model_id)
		]);

		const attrValues = attrValuesArray.reduce(
			(acc, curr) => Object.assign(acc, { [curr.attribute_id]: curr.value }),
			{}
		);

		prisma.$disconnect;
		return responseSuccess(200, { pumpModel, images, attrValues, dutyPoints });
	} catch (/**@type {any} */ error) {
		prisma.$disconnect;
		return responseError(error);
	}
}
