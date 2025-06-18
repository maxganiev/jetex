<script>
	export let type = 'number';
	export let label = undefined;
	export let readonly = false;
	/**
	 * @type {any}
	 */
	export let value;

	/**
	 * @type {{id: number, value: string, text: string}[]}
	 */
	export let options = [];

	export let fullWidth = false;
	$: widthClass = fullWidth ? 'cell-full' : 'cell-half';
</script>

<div class="m-0 p-0 row-cell {widthClass}">
	{#if label}
		<label for="" class="clr-blue">{@html label}</label>
	{/if}

	{#if type === 'number'}
		<input type="number" class="form-control" bind:value {readonly} />
	{:else if type === 'select'}
		<select class="form-control" bind:value>
			{#each options as option (option.id)}
				<option value="{option}">{option.text}</option>
			{/each}
		</select>
	{/if}
</div>

<style lang="scss" scoped>
	.row-cell {
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
