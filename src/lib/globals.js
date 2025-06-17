const IN_DEV_MODE = import.meta.env.MODE === 'development';
const ASSET_PREFIX = IN_DEV_MODE ? '/public_dir' : '';

export const globals = {
	imagePath: ASSET_PREFIX + '/images/',
	generated: ASSET_PREFIX + '/generated/'
};
