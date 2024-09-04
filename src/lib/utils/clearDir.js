import fs from 'fs';

export function clearDir(
	/**@type {string} */ filePath,
	/**@type {number} */ now,
	/**@type {string} @desc {Расширение файлов, которые необходимо очистить} */ fileExtToClean,
	/**@type {number} */ clearInt
) {
	fs.readdir(filePath, (err, fileNames) => {
		if (err) throw err;

		const inProductionMode = process.env.NODE_ENV !== 'development';

		fileNames
			.filter(
				(filename) =>
					filename.split('.')[1] === fileExtToClean &&
					Number(filename.split('.')[0]) < now - (inProductionMode ? clearInt : 5000)
			)
			.forEach((file) =>
				fs.unlink(filePath + file, (err) => {
					if (err) throw new Error(`Failed clearing old files, the reason: ${err}`);
				})
			);
	});
}
