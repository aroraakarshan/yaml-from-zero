<script lang="ts">
	import PracticeEditor from './PracticeEditor.svelte';
	import { exercisesByLesson } from '$lib/data/exercises.js';

	let { lesson }: { lesson: string } = $props();

	const exercises = $derived(exercisesByLesson[lesson] ?? []);
</script>

{#if exercises.length > 0}
	<section class="ps-section">
		<div class="ps-divider">
			<span class="ps-divider-line"></span>
			<span class="ps-divider-label">Practice</span>
			<span class="ps-divider-line"></span>
		</div>

		{#each exercises as exercise (exercise.id)}
			<PracticeEditor {exercise} />
		{/each}
	</section>
{/if}

<style>
	.ps-section {
		margin-top: 3rem;
	}
	.ps-divider {
		display: flex;
		align-items: center;
		gap: 16px;
		margin-bottom: 1rem;
	}
	.ps-divider-line {
		flex: 1;
		height: 1px;
		background: var(--color-border);
	}
	.ps-divider-label {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--color-accent);
	}
</style>
