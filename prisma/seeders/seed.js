import { PrismaClient } from '@prisma/client';
import excelToJson from './excelToJson.js';

const prisma = new PrismaClient();

class Seeder {
	constructor(modelName = '') {
		this.path = '/upload/db/dec_2024/' + modelName + '.xlsx';
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
	const pump_models = new Seeder('pump_models'),
		pump_duty_points = new Seeder('pump_duty_points'),
		images_to_pump_models = new Seeder('images_to_pump_models'),
		attribute_values_to_pump_models = new Seeder('attribute_values_to_pump_models');

	const listOfSeeders = [pump_models, pump_duty_points, images_to_pump_models];

	await prisma.$transaction([
		...listOfSeeders.map((s) => prisma[s.modelName].createMany({ data: s.data })),
		prisma.attribute_values_to_pump_models.createMany({
			data: attribute_values_to_pump_models.data.map((item) =>
				Object.assign({}, { ...item, value: item.value?.toString() || null })
			)
		})
	]);
}

massSeedDb(prisma)
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
