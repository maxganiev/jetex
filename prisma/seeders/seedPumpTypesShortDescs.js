async function seedPumpTypesShortDescs(/** @type {import('@prisma/client').PrismaClient}*/ prisma) {
	const pumpTypesDescs = [
			{ id: 1, desc: 'Вертикальные многоступенчатые центробежные насосы JETEX V' },
			{ id: 2, desc: 'Вертикальные многоступенчатые центробежные насосы JETEX VS' },
			{ id: 3, desc: 'Консольно-моноблочные насосы из нержавеющей стали JETEX KMS' },
			{ id: 4, desc: 'Одноступенчатые циркуляционные насосы типа «IN-LINE» JETEX VL' }
		],
		sql = `UPDATE pump_types SET short_desc = CASE ${pumpTypesDescs
			.map((item) => `WHEN id = ${item.id} THEN '${item.desc}'`)
			.join(' ')} ELSE short_desc END;`;

	await prisma.$executeRawUnsafe(sql);
}

export default seedPumpTypesShortDescs;
