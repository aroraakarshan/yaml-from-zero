<script lang="ts">
	import { searchAll, type SearchEntry } from '$lib/data/search';
	import { goto } from '$app/navigation';
	import { onMount, tick } from 'svelte';

	let open = $state(false);
	let query = $state('');
	let activeIdx = $state(0);
	let inputEl: HTMLInputElement | null = $state(null);

	const results = $derived(searchAll(query));

	$effect(() => {
		query;
		activeIdx = 0;
	});

	async function openPalette() {
		open = true;
		await tick();
		inputEl?.focus();
	}

	function closePalette() {
		open = false;
		query = '';
	}

	function onKey(e: KeyboardEvent) {
		const target = e.target as HTMLElement | null;
		const tag = target?.tagName;
		const typing = tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable;

		if (!open && !typing && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k'))) {
			e.preventDefault();
			openPalette();
			return;
		}

		if (!open) return;

		if (e.key === 'Escape') {
			e.preventDefault();
			closePalette();
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (results.length) activeIdx = (activeIdx + 1) % results.length;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (results.length) activeIdx = (activeIdx - 1 + results.length) % results.length;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			const hit = results[activeIdx];
			if (hit) navigate(hit);
		}
	}

	function navigate(hit: SearchEntry) {
		closePalette();
		goto(hit.url);
	}

	onMount(() => {
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});
</script>

<button class="search-trigger" onclick={openPalette} aria-label="Search">
	<svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
		<circle cx="8.5" cy="8.5" r="5" stroke="currentColor" stroke-width="1.6" />
		<path d="M13 13l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
	</svg>
	<span class="search-trigger-label">Search</span>
	<kbd class="search-trigger-kbd">/</kbd>
</button>

{#if open}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="search-backdrop" onclick={closePalette}></div>
	<div class="search-modal" role="dialog" aria-label="Search">
		<div class="search-input-row">
			<svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
				<circle cx="8.5" cy="8.5" r="5" stroke="currentColor" stroke-width="1.6" />
				<path d="M13 13l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
			</svg>
			<input
				bind:this={inputEl}
				bind:value={query}
				type="text"
				placeholder="Search lessons and glossary…"
				autocomplete="off"
				spellcheck="false"
			/>
			<kbd class="search-esc">Esc</kbd>
		</div>

		<div class="search-results">
			{#if !query.trim()}
				<div class="search-hint">
					Type to search. Use <kbd>↑</kbd><kbd>↓</kbd> to move, <kbd>↵</kbd> to open.
				</div>
			{:else if results.length === 0}
				<div class="search-hint">No matches for "{query}".</div>
			{:else}
				{#each results as hit, i}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="search-hit"
						class:active={i === activeIdx}
						onmouseenter={() => (activeIdx = i)}
						onclick={() => navigate(hit)}
					>
						<span class="search-hit-tag" class:glossary={hit.type === 'glossary'}>
							{hit.type === 'lesson' ? 'Lesson' : 'Term'}
						</span>
						<div class="search-hit-body">
							<div class="search-hit-title">{hit.title}</div>
							<div class="search-hit-sub">{hit.subtitle}</div>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
{/if}

<style>
	.search-trigger {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.45rem 0.6rem;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		color: var(--color-text-muted);
		font-family: inherit;
		font-size: 0.8rem;
		cursor: pointer;
		transition: border-color 0.15s ease, color 0.15s ease;
	}
	.search-trigger:hover {
		border-color: var(--color-accent);
		color: var(--color-text-primary);
	}
	.search-trigger-label {
		flex: 1;
		text-align: left;
	}
	.search-trigger-kbd {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		padding: 0.05rem 0.35rem;
		border: 1px solid var(--color-border);
		border-radius: 3px;
		color: var(--color-text-muted);
		background: var(--color-bg);
	}

	.search-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(40, 30, 20, 0.35);
		z-index: 300;
		backdrop-filter: blur(2px);
	}

	.search-modal {
		position: fixed;
		top: 10vh;
		left: 50%;
		transform: translateX(-50%);
		width: min(560px, calc(100vw - 2rem));
		max-height: 70vh;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		box-shadow: 0 20px 50px rgba(40, 30, 20, 0.25);
		z-index: 301;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.search-input-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}

	.search-input-row input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--color-text-primary);
		font-size: 0.95rem;
		font-family: inherit;
	}

	.search-esc {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		padding: 0.1rem 0.4rem;
		border: 1px solid var(--color-border);
		border-radius: 3px;
		color: var(--color-text-muted);
	}

	.search-results {
		overflow-y: auto;
		padding: 0.4rem;
	}

	.search-hint {
		padding: 1rem;
		color: var(--color-text-muted);
		font-size: 0.85rem;
		text-align: center;
	}
	.search-hint kbd {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		padding: 0.05rem 0.35rem;
		margin: 0 0.1rem;
		border: 1px solid var(--color-border);
		border-radius: 3px;
	}

	.search-hit {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.55rem 0.75rem;
		border-radius: 6px;
		cursor: pointer;
	}
	.search-hit.active {
		background: var(--color-bg);
	}

	.search-hit-tag {
		font-size: 0.6rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.15rem 0.4rem;
		border-radius: 3px;
		background: var(--color-accent);
		color: white;
		font-weight: 600;
		flex-shrink: 0;
	}
	.search-hit-tag.glossary {
		background: var(--color-text-muted);
	}

	.search-hit-body {
		flex: 1;
		min-width: 0;
	}
	.search-hit-title {
		font-size: 0.88rem;
		color: var(--color-text-primary);
		font-weight: 500;
	}
	.search-hit-sub {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		margin-top: 0.1rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
