import { fileURLToPath } from 'url';
import { dirname } from 'path';
import xlsx from 'node-xlsx';

function excelDateToISO(/**@type {Number | undefined | null} */ excelDate) {
  if (!excelDate) return null;

  let date = new Date((parseInt(excelDate) - (25567 + 2)) * 86400 * 1000),
    unix = date.getTime();

  return new Date(unix);
}

function excelToJson(
  options = {
    filePath: '',
    date: {
      toParse: false,
      fieldNames: [],
    },
  },
) {
  const __filename = fileURLToPath(import.meta.url),
    __dirname = dirname(__filename),
    parsed = xlsx.parse(`${__dirname}${options.filePath}`)[0].data,
    keys = parsed[0],
    json = parsed.slice(1).reduce((acc, curr) => {
      const o = {};

      if (!options.date || !options.date.toParse)
        keys.forEach((key, index) => (o[key] = curr[index]));
      else
        keys.forEach((key, index) => {
          o[key] = !options.date.fieldNames.includes(key)
            ? curr[index]
            : excelDateToISO(curr[index]);
        });

      return [...acc, o];
    }, []);

  return json;
}

export default excelToJson;
