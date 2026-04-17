<script lang="ts">
	import { onMount } from 'svelte';

	let progress = $state(0);

	onMount(() => {
		const scrollRoot = document.getElementById('main-scroll');
		if (!scrollRoot) return;

		function update() {
			const { scrollTop, scrollHeight, clientHeight } = scrollRoot!;
			const max = scrollHeight - clientHeight;
			progress = max > 0 ? (scrollTop / max) * 100 : 0;
		}

		scrollRoot.addEventListener('scroll', update, { passive: true });
		return () => scrollRoot.removeEventListener('scroll', update);
	});
</script>

<div class="scroll-progress" style="width: {progress}%"></div>

<style>
	.scroll-progress {
		position: fixed;
		top: 0;
		left: 0;
		height: 2px;
		background: linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end));
		z-index: 1000;
		transition: width 0.1s linear;
	}
</style>
