import { responseFile } from '$lib/api_responses/responseFile';
import fs from 'fs';

export async function GET(/**@type {any}*/ request) {
	return await responseFile(fs, request, 'generated');
}
