<script lang="ts">
	import { modules } from '$lib/data/modules';
	import BundleCard from '$lib/components/BundleCard.svelte';
</script>

<div class="not-prose">
	<div class="landing-header">
		<div class="landing-links">
			<a href="https://akarshanarora.com" target="_blank" rel="noopener">Who am I</a>
			<a href="/glossary">Glossary</a>
			<a href="https://www.linkedin.com/in/aroraakarshan/" target="_blank" rel="noopener"
				>LinkedIn</a
			>
			<a href="https://topmate.io/akarshanarora" target="_blank" rel="noopener" class="landing-cta"
				>Book a 1:1</a
			>
		</div>
	</div>

	<h1 class="landing-title">YAML from Zero</h1>
	<p class="landing-subtitle">
		Learn YAML for semiconductor design — interactively. No coding experience needed.
	</p>
	<p class="landing-author">
		by <a href="https://akarshanarora.com" target="_blank" rel="noopener">Akarshan Arora</a>
	</p>

	<a href="/lesson-01" class="landing-start">Start Learning →</a>

	<div class="landing-outline">
		{#each modules as mod}
			<div class="landing-module">
				<h3 class="landing-module-title">Part {mod.id} · {mod.title}</h3>
				{#each mod.lessons as lesson, i}
					{@const globalIndex =
						modules
							.slice(0, modules.indexOf(mod))
							.reduce((sum, m) => sum + m.lessons.length, 0) +
						i +
						1}
					<a href="/{lesson.slug}" class="landing-lesson">
						<span class="landing-lesson-num">{String(globalIndex).padStart(2, '0')}</span>
						<span class="landing-lesson-title">{lesson.title}</span>
						<span class="landing-lesson-desc">{lesson.description}</span>
					</a>
				{/each}
			</div>
		{/each}
	</div>

	<BundleCard />
</div>

<style>
	.landing-header {
		margin-bottom: 2.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
	}

	.landing-links {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.landing-links a {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		text-decoration: none;
		transition: opacity 0.2s;
	}

	.landing-links a:hover {
		opacity: 0.7;
	}

	.landing-cta {
		margin-left: auto;
		padding: 0.4rem 1rem;
		border-radius: 6px;
		background: var(--color-accent);
		color: #fff !important;
		font-weight: 600;
	}

	.landing-cta:hover {
		opacity: 0.9;
	}

	.landing-title {
		font-family: var(--font-body);
		font-size: clamp(2.2rem, 5vw, 3rem);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 0.5rem;
		letter-spacing: -0.02em;
		line-height: 1.2;
	}

	.landing-subtitle {
		font-size: 1.05rem;
		color: var(--color-text-secondary);
		margin: 0 0 0.5rem;
		line-height: 1.6;
	}

	.landing-author {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin: 0 0 1.5rem;
	}

	.landing-author a {
		color: var(--color-accent);
		text-decoration: none;
	}

	.landing-author a:hover {
		text-decoration: underline;
	}

	.landing-start {
		display: inline-block;
		padding: 0.6rem 1.4rem;
		border-radius: 6px;
		background: var(--color-accent);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 600;
		text-decoration: none;
		margin-bottom: 2.5rem;
		transition: opacity 0.2s;
	}

	.landing-start:hover {
		opacity: 0.9;
	}

	.landing-outline {
		border-top: 1px solid var(--color-border);
		padding-top: 1.5rem;
	}

	.landing-module {
		margin-bottom: 1.5rem;
	}

	.landing-module-title {
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-text-muted);
		margin: 0 0 0.5rem;
	}

	.landing-lesson {
		display: grid;
		grid-template-columns: 2rem 1fr;
		grid-template-rows: auto auto;
		gap: 0 0.75rem;
		padding: 0.6rem 0.75rem;
		margin: 0 -0.75rem;
		border-radius: 6px;
		text-decoration: none;
		color: inherit;
		transition: background 0.15s;
	}

	.landing-lesson:hover {
		background: var(--color-bg-secondary);
	}

	.landing-lesson-num {
		grid-row: 1 / 3;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--color-text-muted);
		padding-top: 0.15rem;
	}

	.landing-lesson-title {
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.landing-lesson:hover .landing-lesson-title {
		color: var(--color-accent);
	}

	.landing-lesson-desc {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		line-height: 1.4;
	}
</style>
