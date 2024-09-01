<script>
	import { IS_MOBILE } from '$lib/stores/ui';

	$: paddingClass = $IS_MOBILE ? 'px-2 py-2' : 'px-5 py-3';
</script>

<div class="{paddingClass}">
	<slot />
</div>
