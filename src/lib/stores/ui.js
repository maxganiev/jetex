import { writable } from 'svelte/store';

export const IS_MOBILE = writable(false),
	SHOW_LOADER = writable(false),
	ALERT = writable({ type: 'warning' || 'danger' || 'success', show: false, msg: '' }),
	SHOW_SELECTION_HISTORY = writable(false);
