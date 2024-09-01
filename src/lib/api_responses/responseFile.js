import { responseError } from './responseError';

/**
 * @param {typeof import("fs")} fs
 * @param {{ url: { search: String; }; }} request
 * @param {String} dir
 */
export async function responseFile(fs, request, dir) {
	try {
		const fileName = process.cwd() + '/public_dir/' + dir + '/' + request.url.search.split('?f=')[1];

		const file = await new Promise((resolve, reject) => {
			fs.readFile(
				fileName,
				(
					/** @type {any} */ err,
					/** @type {WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>} */ data
				) => {
					if (err) {
						reject(err);
					} else {
						resolve(Buffer.from(data));
					}
				}
			);
		});

		if (!file) return { status: 404 };
		const f = new File([file], 'new_download');
		return new Response(f);
	} catch (error) {
		return responseError('Файл был удален.', 'html');
	}
}
