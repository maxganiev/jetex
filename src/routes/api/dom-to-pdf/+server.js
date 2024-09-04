import pdf from 'html-pdf';
// @ts-ignore
import { clearDir } from '$lib/utils/clearDir';

export async function POST(/**@type {any}*/ { request }) {
	const now = Date.now();
	const filePath = './public_dir/generated/';
	const requestData = await request.json();
	const fileName = filePath + now + '.pdf';
	const pageOrientation = (requestData.options && requestData.options.orientation) || 'portrait';

	if (requestData) {
		clearDir(filePath, now, 'pdf', 4.32e7);

		try {
			const constructedFilePath = await new Promise((resolve, reject) => {
				pdf.create(requestData.content, {
					phantomArgs: ['--local-url-access=false'],
					orientation: pageOrientation
				}).toFile(fileName, (err, res) => {
					if (err) reject(err);
					resolve(res);
				});
			}).then(() => fileName);

			return new Response(constructedFilePath);
		} catch (err) {
			return new Response(JSON.stringify({ response: `Failed to create PDF, reason: ${err}` }));
		}
	}
}
