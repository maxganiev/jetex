/**
 * @param {Object & {url: String, params: any}} options
 */
export function ajax(options) {
	return {
		async getJSON() {
			try {
				const fetchUrl = options.params
						? `/api/${options.url}?${new URLSearchParams(options.params)}`
						: `/api/${options.url}`,
					request = await fetch(fetchUrl),
					response = await request.json();

				return response;
			} catch (error) {
				return { error };
			}
		}
	};
}
