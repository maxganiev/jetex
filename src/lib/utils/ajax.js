import { SHOW_LOADER } from '$lib/stores/ui';

/**
 * @param {Object & {url: String, params: any}} options
 */
export function ajax(options) {
	return {
		async getJSON() {
			SHOW_LOADER.set(true);
			try {
				const fetchUrl = options.params
						? `/api/${options.url}?${new URLSearchParams(options.params)}`
						: `/api/${options.url}`,
					request = await fetch(fetchUrl),
					response = await request.json();

				SHOW_LOADER.set(false);
				return response;
			} catch (error) {
				SHOW_LOADER.set(false);
				return { error };
			}
		},

		async postAndGetText() {
			SHOW_LOADER.set(true);
			try {
				const request = await fetch(options.url, {
						method: 'POST',
						body: JSON.stringify(options.params)
					}),
					response = await request.text();
				SHOW_LOADER.set(false);
				return response;
			} catch (error) {
				SHOW_LOADER.set(false);
				return { error };
			}
		},

		async postAndGetJSON() {}
	};
}
