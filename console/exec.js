import xlsx from 'node-xlsx';
import log from './log.js';
import * as fs from 'fs';

const parsed = xlsx.parse(
	'/Applications/XAMPP/xamppfiles/htdocs/jetex/prisma/seeders/upload/JETEX тех описание/V_VS/Насосы V_VS 8.xlsx'
);
//.map((obj) => obj.data);

log(parsed[parsed.length - 1].data);

function getPumpsIds(startId, endId) {
	const ids = [];
	for (let id = startId; id <= endId; id++) ids.push(id);
	return ids;
}

const attrsIds = [
	1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 17, 18, 19, 20, 21,
	22, 23, 24, 25, 26
];

const pumpsIds = getPumpsIds(66, 91);

// const result = [];
// parsed.forEach((sheet) => {
// 	let jetexV = [],
// 		jetexVS = [];

// 	const sizesJetexV = sheet[2].filter((n) => !isNaN(Number(n))).slice(0, -1),
// 		sizesJetexVS = sheet[3].filter((n) => !isNaN(Number(n))).slice(0, -1);
// 	sizesJetexVS.push(sizesJetexV[sizesJetexV.length - 1]);

// 	const values = sheet.slice(5).map((arr) => arr[arr.length - 1]);
// 	values[12] = values[12] + '; ' + values[13];
// 	values.splice(13, 1);
// 	values[25] = 'NJK-12';

// 	jetexV = [...values, ...sizesJetexV];
// 	jetexVS = [...values, ...sizesJetexVS];

// 	result.push(...jetexV, ...jetexVS);
// });

//log(result);

// const sizesJetexV = parsed[2].filter((n) => !isNaN(Number(n))).slice(0, -1),
// 	sizesJetexVS = parsed[3].filter((n) => !isNaN(Number(n))).slice(0, -1);
// sizesJetexVS.push(sizesJetexV[sizesJetexV.length - 1]);

// const values = parsed.slice(5).map((arr) => arr[arr.length - 1]);
// values[12] = values[12] + '; ' + values[13];
// values.splice(13, 1);
// values[25] = 'NJK-12';

// const result = {
// 	v: [...values, ...sizesJetexV],
// 	vs: [...values, ...sizesJetexVS]
// };

// log(result.v);

//xlsx.set_fs(fs);
