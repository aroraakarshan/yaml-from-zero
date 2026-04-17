<script lang="ts">
	import { modules } from '$lib/data/modules';
	import { page } from '$app/state';

	let mobileOpen = $state(false);

	const currentPath = $derived(page.url.pathname);

	function isActive(slug: string) {
		return currentPath === `/${slug}`;
	}

	const allLessons = $derived(modules.flatMap((m) => m.lessons));

	function closeMobile() {
		mobileOpen = false;
	}
</script>

<!-- Mobile toggle -->
<button class="sidebar-toggle" onclick={() => (mobileOpen = !mobileOpen)} aria-label="Toggle menu">
	<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
		{#if mobileOpen}
			<path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="1.5" />
		{:else}
			<path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" />
		{/if}
	</svg>
</button>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if mobileOpen}
	<div class="sidebar-backdrop" onclick={closeMobile}></div>
{/if}

<aside class="sidebar" class:open={mobileOpen}>
	<a href="/" class="sidebar-logo" onclick={closeMobile}>
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
			<rect x="2" y="2" width="20" height="20" rx="4" stroke="var(--color-accent)" stroke-width="1.5" />
			<text x="12" y="16" text-anchor="middle" fill="var(--color-accent)" font-size="11" font-weight="700" font-family="JetBrains Mono, monospace">Y</text>
		</svg>
		<span class="sidebar-title">YAML from Zero</span>
	</a>

	<nav class="sidebar-nav">
		{#each modules as mod}
			<div class="sidebar-module">
				<span class="sidebar-module-label">Part {mod.id} · {mod.title}</span>
				{#each mod.lessons as lesson, i}
					{@const globalIndex = allLessons.indexOf(lesson) + 1}
					<a
						href="/{lesson.slug}"
						class="sidebar-link"
						class:active={isActive(lesson.slug)}
						onclick={closeMobile}
					>
						<span class="sidebar-num">{String(globalIndex).padStart(2, '0')}</span>
						<span class="sidebar-link-title">{lesson.title}</span>
					</a>
				{/each}
			</div>
		{/each}
	</nav>
</aside>

<style>
	.sidebar-toggle {
		position: fixed;
		top: 0.75rem;
		left: 0.75rem;
		z-index: 200;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-secondary);
		padding: 0.4rem;
		cursor: pointer;
		display: none;
	}

	.sidebar-backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
		background: rgba(0, 0, 0, 0.2);
	}

	.sidebar {
		width: 220px;
		flex-shrink: 0;
		overflow-y: auto;
		padding: 1.25rem 0.75rem;
		border-right: 1px solid var(--color-border);
		scrollbar-width: none;
	}

	.sidebar::-webkit-scrollbar {
		display: none;
	}

	.sidebar-logo {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		text-decoration: none;
		margin-bottom: 1.5rem;
		padding: 0 0.5rem;
	}

	.sidebar-title {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-text-primary);
		letter-spacing: -0.01em;
	}

	.sidebar-nav {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.sidebar-module {
		display: flex;
		flex-direction: column;
	}

	.sidebar-module-label {
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-text-muted);
		padding: 0 0.5rem;
		margin-bottom: 0.35rem;
	}

	.sidebar-link {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		padding: 0.35rem 0.5rem;
		border-radius: 6px;
		text-decoration: none;
		color: var(--color-text-secondary);
		font-size: 0.78rem;
		transition: all 0.15s ease;
	}

	.sidebar-link:hover {
		background: var(--color-bg-secondary);
		color: var(--color-text-primary);
	}

	.sidebar-link.active {
		background: var(--color-accent-bg);
		color: var(--color-accent);
	}

	.sidebar-num {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		color: var(--color-text-muted);
		min-width: 1.2rem;
	}

	.sidebar-link.active .sidebar-num {
		color: var(--color-accent);
	}

	.sidebar-link-title {
		line-height: 1.3;
	}

	@media (max-width: 768px) {
		.sidebar-toggle {
			display: block;
		}

		.sidebar {
			position: fixed;
			top: 0;
			left: 0;
			bottom: 0;
			z-index: 100;
			background: var(--color-bg-primary);
			transform: translateX(-100%);
			transition: transform 0.25s ease;
		}

		.sidebar.open {
			transform: translateX(0);
		}
	}
</style>
