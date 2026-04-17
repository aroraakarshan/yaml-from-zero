<script lang="ts">
	interface Props {
		minutes: number;
		learn: string[];
	}
	let { minutes, learn }: Props = $props();
</script>

<div class="lesson-header not-prose">
	<div class="lh-meta">
		<span class="lh-time">{minutes} min read</span>
		<span class="lh-dot">·</span>
		<span class="lh-level">Beginner</span>
	</div>

	<div class="lh-learn">
		<div class="lh-learn-eyebrow">You will learn</div>
		<ul class="lh-learn-list">
			{#each learn as item}
				<li>{item}</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.lesson-header {
		margin: 0 0 2rem;
		padding: 1rem 1.25rem 1.15rem;
		border: 1px solid var(--color-border);
		border-left: 3px solid var(--color-accent);
		border-radius: 6px;
		background: #fbf6ee;
	}

	.lh-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		margin-bottom: 0.7rem;
	}
	.lh-dot {
		opacity: 0.5;
	}
	.lh-time {
		color: var(--color-accent);
	}

	.lh-learn-eyebrow {
		font-family: var(--font-ui);
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		color: var(--color-text-secondary);
		margin-bottom: 0.35rem;
	}

	.lh-learn-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.lh-learn-list li {
		font-family: var(--font-body);
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--color-text-primary);
		padding-left: 1.25rem;
		position: relative;
		margin: 0.2rem 0;
	}
	.lh-learn-list li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: var(--color-accent);
		font-weight: 700;
	}
</style>
