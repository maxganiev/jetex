import { PumpType } from '$lib/types';

/**
 * @arg {Object & {data: {pumpTypes: PumpType[]}}} data
 */
export async function load({ data }) {
	return data;
}
