<div class="row flex-row-gap-0-5 fs-sm-md input-row p-2">
	<slot />
</div>

<style lang="scss" scoped>
	.input-row {
		border: 1px #eee solid;
		border-radius: 5px;
		margin-top: 1rem !important;
		column-gap: 0.5rem;
		max-width: 1200px;

		@media (min-width: 150px) and (max-width: 767px) {
			column-gap: 0;
		}
	}
</style>
