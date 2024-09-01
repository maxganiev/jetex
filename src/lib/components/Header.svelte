<script>
	import { globals } from '$lib/globals';
	import GutterXY from './Gutters/GutterXY.svelte';
</script>

<header class="w-100 bg-clr-white-beige">
	<GutterXY>
		<div class="d-flex">
			<a href="https://www.jetexpumps.ru/" target="_blank" class="w-15 d-block">
				<img src="{globals.imagePath}logo_jetex.png" alt="logo" class="w-75 object-fit-contain" />
			</a>
		</div>
	</GutterXY>
</header>
