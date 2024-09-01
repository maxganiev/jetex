export function responseSuccess(/**@type {Number}*/ status = 200, /**@type {any}*/ body) {
	return new Response(JSON.stringify({ status, body }));
}
