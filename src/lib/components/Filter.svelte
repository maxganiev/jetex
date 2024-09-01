<script>
	import { IS_MOBILE } from '$lib/stores/ui';

	$: lowerGutter = $IS_MOBILE ? 2 : 3;
</script>

<div class="row pb-{lowerGutter}">
	<div class="col-sm-12"> ***FILTER CHIPS GO HERE*** </div>
</div>
