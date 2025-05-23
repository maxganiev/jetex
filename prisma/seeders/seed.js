import { PrismaClient } from '@prisma/client';
import excelToJson from './excelToJson.js';

const prisma = new PrismaClient();

class Seeder {
	constructor(path, modelName) {
		if (!path || !modelName) throw new Error('path or modelName missed');

		this.path = '/upload/db/' + path + '/' + modelName + '.xlsx';
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
	const currentDir = 'may_2025';
	const pump_duty_points = new Seeder(currentDir, 'pump_duty_points'),
		attribute_values_to_pump_models = new Seeder(currentDir, 'attribute_values_to_pump_models');

	await prisma.$transaction([
		prisma.pump_duty_points.createMany({ data: pump_duty_points.data }),

		prisma.images_to_pump_models.createMany({
			data: [
				{
					type_id: 2,
					img_url: 'drawings/vl-300.png',
					pump_model_id: 563
				},

				{
					type_id: 2,
					img_url: 'drawings/kms-65-50.png',
					pump_model_id: 564
				}
			]
		}),

		prisma.attribute_values_to_pump_models.createMany({
			data: attribute_values_to_pump_models.data.map((item) =>
				Object.assign({}, { ...item, value: item.value?.toString() || null })
			)
		}),

		prisma.pump_q_range.createMany({
			data: [
				{
					pump_type_id: 4,
					pump_model_id: 563,
					q_from: 270,
					q_to: 1200
				},

				{
					pump_type_id: 3,
					pump_model_id: 564,
					q_from: 5,
					q_to: 60
				}
			]
		})
	]);
}

async function seedPumpQRangeTable(prisma) {
	console.log('DB seeded already');
	return;

	const pump_q_range = new Seeder('apr_2020', 'pump_q_range');
	await prisma[pump_q_range.modelName].createMany({ data: pump_q_range.data });
}

async function addNewModels(prisma) {
	try {
		await prisma.pump_models.createMany({
			data: [
				{ id: 563, name: 'JETEX VL 300-15/4', pump_type_id: 4 },
				{ id: 564, name: 'JETEX KMS 65-50-200/7.5', pump_type_id: 3 }
			]
		});
	} catch (error) {
		throw new Error(error);
	}
}

async function updateData(prisma) {
	try {
		await prisma.$transaction([
			prisma.pump_models.update({
				where: { id: 497 },
				data: {
					name: 'JETEX VL 200-20/4A'
				}
			}),

			prisma.pump_models.update({
				where: { id: 499 },
				data: {
					name: 'JETEX VL 200-32/4A'
				}
			}),

			prisma.$executeRaw`UPDATE attribute_values_to_pump_models SET value = REPLACE(value, '~', '...') WHERE value LIKE '%~%'`
		]);
	} catch (error) {
		throw new Error(error);
	}
}

async function seed() {
	console.log('seeded already');
	return;

	try {
		await addNewModels(prisma);
		await massSeedDb(prisma);
		await updateData(prisma);
		await prisma.$disconnect();
	} catch (error) {
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	}
}

seed();
