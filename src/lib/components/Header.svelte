<script>
	import { globals } from '$lib/globals';
	import Icon from '@iconify/svelte';
	import GutterXY from './Gutters/GutterXY.svelte';
	import Tooltip from './Tooltip.svelte';
	import { SHOW_SELECTION_HISTORY } from '$lib/stores/ui';
</script>

<header class="w-100 bg-clr-white-beige">
	<GutterXY>
		<div class="d-flex">
			<a href="https://www.jetexpumps.ru/" target="_blank" class="w-15 d-block">
				<img
					src="{globals.imagePath}logo_jetex.png"
					alt="logo"
					class="w-75 object-fit-contain"
					style="min-width: 100px;"
				/>
			</a>
			<div class="flex-grow-1"></div>

			<Tooltip tipContent="История подбора">
				<button
					class="btn btn-sm rounded-circle border-0 bg-clr-transparent p-0"
					style="width: 2em; height: 2em;"
					on:click="{() => ($SHOW_SELECTION_HISTORY = !$SHOW_SELECTION_HISTORY)}"
				>
					<Icon icon="material-symbols:history" style="color: #234c8c" width="2em" height="2em" />
				</button>
			</Tooltip>
		</div>
	</GutterXY>
</header>
