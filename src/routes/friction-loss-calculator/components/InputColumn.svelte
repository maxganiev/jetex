<script>
	export let fullWidth = false;
	$: widthClass = fullWidth ? 'cell-full' : 'cell-half';
</script>

<div class="d-flex flex-column flex-row-gap-0-25 px-0 mt-0 input-column {widthClass}">
	<slot />
</div>

<style lang="scss" scoped>
	.input-column {
		&.cell-half {
			//bcz column-gap = 0.5rem set here:
			//src/routes/friction-loss-calculator/components/InputRow.svelte
			width: calc(50% - 0.5rem);

			@media (min-width: 150px) and (max-width: 767px) {
				width: 100%;
			}
		}

		&.cell-full {
			width: 100%;
		}
	}
</style>
