import { PrismaClient } from '@prisma/client';
import excelToJson from './excelToJson.js';
import getAllPumpTypes from './api_test_functions/getAllPumpTypes.js';
import getAttributesToSelectedPumpTypes from './api_test_functions/getAttributesToSelectedPumpTypes.js';
import getPumpModelByDutyPoint from './api_test_functions/getPumpModelByDutyPoint.js';
import getAttributeValuesToPumpModel from './api_test_functions/getAttributeValuesToPumpModel.js';
import getImagesToPumpModel from './api_test_functions/getImagesToPumpModel.js';
import seedPumpTypesShortDescs from './seedPumpTypesShortDescs.js';

const prisma = new PrismaClient();

class Seeder {
	constructor(modelName = '') {
		this.path = '/upload/db/' + modelName + '.xlsx';
		this.modelName = modelName;

		const res = excelToJson({ filePath: this.path }),
			keys = Object.keys(res[0]);

		this.data = res.map((item) =>
			Object.assign(
				{},
				{ ...keys.reduce((acc, key) => Object.assign(acc, { [key]: item[key] || null }), {}) }
			)
		);

		//console.log(this.data)
	}
}

async function massSeedDb() {
	const pump_types = new Seeder('pump_types'),
		pump_models = new Seeder('pump_models'),
		pump_duty_points = new Seeder('pump_duty_points'),
		attribute_groups = new Seeder('attribute_groups'),
		attribute_values_to_pump_models = new Seeder('attribute_values_to_pump_models'),
		attributes_to_pump_types = new Seeder('attributes_to_pump_types'),
		attributes = new Seeder('attributes'),
		images_to_pump_types = new Seeder('images_to_pump_types'),
		images_to_pump_models = new Seeder('images_to_pump_models');

	const listOfSeeders = [
		pump_types,
		pump_models,
		pump_duty_points,
		attribute_groups,
		attributes,
		attributes_to_pump_types,
		images_to_pump_models,
		images_to_pump_types
	];

	await prisma.$transaction([
		...listOfSeeders.map((s) => prisma[s.modelName].createMany({ data: s.data })),
		prisma.attribute_values_to_pump_models.createMany({
			data: attribute_values_to_pump_models.data.map((item) =>
				Object.assign({}, { ...item, value: item.value?.toString() || null })
			)
		})
	]);
}

async function testApiQuery(/**@type {Function} */ functionToTest, /**@type {any[]} */ args) {
	functionToTest.apply(null, args);
}

//testApiQuery(getPumpModelByDutyPoint, [prisma, { pump_type_id: 2, q: 1.4, h: 15.6 }])
//testApiQuery(getAttributeValuesToPumpModel, [prisma, 7])
//testApiQuery(getAttributesToSelectedPumpTypes, [prisma, [1, 4]])

async function rewriteAttributeValuesToPumpModels() {
	const attribute_values_to_pump_models = new Seeder('attribute_values_to_pump_models');

	await prisma.attribute_values_to_pump_models.createMany({
		data: attribute_values_to_pump_models.data.map((item) =>
			Object.assign({}, { ...item, value: item.value?.toString() || null })
		)
	});
}

await seedPumpTypesShortDescs(prisma);
rewriteAttributeValuesToPumpModels()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
