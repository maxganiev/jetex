<script>
	import Icon from '@iconify/svelte';
	import { bounceInOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	export let type = 'warning' || 'danger' || 'success',
		msg = '';

	/**@type {Object<String,String>}*/
	const alertIcons = {
		warning: 'mdi:warning-outline',
		danger: 'solar:danger-triangle-bold',
		success: 'mdi:dangerous'
	};

	$: icon = alertIcons[type];
</script>

<div
	class="alert alert-{type} pos-f top-left z-2 w-100 p-3 text-center"
	role="alert"
	in:fly="{{ duration: 1200, y: -200, easing: bounceInOut }}"
>
	<Icon {icon} style="color: inherit" width="1.5em" height="1.5em" />
	<strong class="fs-sm-md">
		{msg}
	</strong>
</div>
