import { PrismaClient } from '@prisma/client';
import excelToJson from './excelToJson.js';

const prisma = new PrismaClient();

class Seeder {
	constructor(path, modelName = '') {
		this.path = '/upload/db/' + (path || 'mar_2025') + '/' + modelName + '.xlsx';
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
	console.log('DB seeded already');
	return;

	const pump_models = new Seeder('pump_models'),
		pump_duty_points = new Seeder('pump_duty_points'),
		images_to_pump_models = new Seeder('images_to_pump_models'),
		attributes = new Seeder('attributes'),
		attributes_to_pump_types = new Seeder('attributes_to_pump_types'),
		attribute_values_to_pump_models = new Seeder('attribute_values_to_pump_models');

	const listOfSeeders = [
		pump_models,
		pump_duty_points,
		images_to_pump_models,
		attributes,
		attributes_to_pump_types
	];

	await prisma.$transaction([
		...listOfSeeders.map((s) => prisma[s.modelName].createMany({ data: s.data })),

		prisma.attribute_values_to_pump_models.createMany({
			data: attribute_values_to_pump_models.data.map((item) =>
				Object.assign({}, { ...item, value: item.value?.toString() || null })
			)
		}),

		//этих атрибутов не было при изначальной загрузке этих моделей насосов, довношу:
		prisma.attribute_values_to_pump_models.createMany({
			data: [
				//JETEX VL 40-26/2
				{ attribute_id: 56, pump_model_id: 15, value: '235' },
				{ attribute_id: 57, pump_model_id: 15, value: '195' },
				{ attribute_id: 58, pump_model_id: 15, value: '235' },

				//JETEX VL 80-30/2
				{ attribute_id: 56, pump_model_id: 17, value: '235' },
				{ attribute_id: 57, pump_model_id: 17, value: '195' },
				{ attribute_id: 58, pump_model_id: 17, value: '235' },

				//JETEX VL 100-34/2
				{ attribute_id: 56, pump_model_id: 18, value: '235' },
				{ attribute_id: 57, pump_model_id: 18, value: '195' },
				{ attribute_id: 58, pump_model_id: 18, value: '235' },

				//JETEX VL 125-28/4
				{ attribute_id: 56, pump_model_id: 19, value: '350' },
				{ attribute_id: 57, pump_model_id: 19, value: '290' },
				{ attribute_id: 58, pump_model_id: 19, value: '350' },

				//JETEX KMS 40-160/4
				{ attribute_id: 59, pump_model_id: 11, value: '80' },

				//JETEX KMS 65-160/11
				{ attribute_id: 59, pump_model_id: 12, value: '100' },

				//JETEX KMX 80-200/22
				{ attribute_id: 59, pump_model_id: 13, value: '125' },

				//JETEX KMS 80-200/30
				{ attribute_id: 59, pump_model_id: 14, value: '125' }
			]
		}),

		//отвязываем ненужные атрибуты (Кол-во ступеней и Код резины) от типов VL, KMS
		prisma.attributes_to_pump_types.deleteMany({
			where: { AND: { pump_type_id: { in: [3, 4] }, attribute_id: { in: [4, 10] } } }
		})
	]);
}

async function seedPumpQRangeTable(prisma) {
	const pump_q_range = new Seeder('apr_2020', 'pump_q_range');
	await prisma[pump_q_range.modelName].createMany({ data: pump_q_range.data });
}

//massSeedDb(prisma)
seedPumpQRangeTable(prisma)
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
