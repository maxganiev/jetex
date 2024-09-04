<script>
	import { globals } from '$lib/globals';
</script>

<div class="w-100 h-100 pos-f top-left z-2 d-flex align-items-center justify-content-center bg-clr-white-beige o-0-3">
	<img
		class="w-30 object-fit-contain logo-loader"
		alt="jetex logo"
		src="{globals.imagePath}logo_jetex_circle.png"
	/>
</div>

<style lang="scss" scoped>
	.logo-loader {
		max-width: 80px;
		animation-name: rotate-logo;
		animation-duration: 0.15s;
		animation-iteration-count: infinite;
		animation-timing-function: ease-in;
	}

	@keyframes rotate-logo {
		25% {
			transform: rotate(0deg);
		}

		50% {
			transform: rotate(180deg);
		}

		75% {
			transform: rotate(270deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}
</style>
