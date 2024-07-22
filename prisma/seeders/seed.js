import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
	const names = ['Foo', 'Bar', 'Hello', 'World', 'John', 'Doe'];

	await prisma.test.createMany({ data: names.map((name) => Object.assign({}, { name })) });
	console.log(await prisma.test.findMany());
}

seed()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
