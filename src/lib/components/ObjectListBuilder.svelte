<script lang="ts">
	let step = $state(-1);

	interface Token {
		text: string;
		type: 'key' | 'colon' | 'str' | 'num' | 'bool' | 'comment' | 'indent' | 'dash';
	}

	function tok(text: string, type: Token['type']): Token {
		return { text, type };
	}

	interface Line {
		tokens: Token[];
		explain: string;
		itemIdx: number; // which object this belongs to, -1 for header
	}

	const lines: Line[] = [
		{
			tokens: [tok('test_list', 'key'), tok(':', 'colon')],
			explain: 'The label for our list. Nothing after the colon — the list items will be below, indented.',
			itemIdx: -1,
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('name', 'key'), tok(': ', 'colon'), tok('"power_test"', 'str')],
			explain: 'The dash starts a NEW list item — this is item #1. "name" is its first field. Think of the dash as starting a new index card.',
			itemIdx: 0,
		},
		{
			tokens: [tok('    ', 'indent'), tok('duration', 'key'), tok(': ', 'colon'), tok('30', 'num')],
			explain: 'No dash here! That means this field belongs to the SAME item as "name" above. Both "name" and "duration" are on the same index card.',
			itemIdx: 0,
		},
		{
			tokens: [tok('    ', 'indent'), tok('important', 'key'), tok(': ', 'colon'), tok('true', 'bool')],
			explain: 'Still no dash — still the same item. Item #1 now has three fields: name, duration, and important. One complete index card.',
			itemIdx: 0,
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('name', 'key'), tok(': ', 'colon'), tok('"speed_test"', 'str')],
			explain: 'A NEW dash at the same indent level = a NEW list item! This is item #2. The dash tells YAML: "start a fresh index card."',
			itemIdx: 1,
		},
		{
			tokens: [tok('    ', 'indent'), tok('duration', 'key'), tok(': ', 'colon'), tok('15', 'num')],
			explain: 'No dash — belongs to item #2. Same pattern: the dash starts the item, everything below (without a dash) is part of it.',
			itemIdx: 1,
		},
		{
			tokens: [tok('    ', 'indent'), tok('important', 'key'), tok(': ', 'colon'), tok('true', 'bool')],
			explain: 'Item #2 is complete with its three fields. The rule: new dash = new item. No dash = same item.',
			itemIdx: 1,
		},
	];

	// Cards shown on the right
	interface Card {
		name: string;
		duration: string;
		important: string;
	}

	let visibleCards = $derived.by(() => {
		const cards: Card[] = [];
		if (step >= 1) cards.push({ 
			name: 'power_test', 
			duration: step >= 2 ? '30 min' : '...', 
			important: step >= 3 ? 'true' : '...' 
		});
		if (step >= 4) cards.push({ 
			name: 'speed_test', 
			duration: step >= 5 ? '15 min' : '...', 
			important: step >= 6 ? 'true' : '...' 
		});
		return cards;
	});

	function goTo(idx: number) {
		step = Math.max(-1, Math.min(idx, lines.length - 1));
	}

	function replay() { step = -1; }
</script>

<div class="ol-container">
	<div class="ol-header">
		<h3>Interactive: Lists of Objects</h3>
		<p>Click Next — watch how dashes create separate "index cards," each with its own fields</p>
	</div>

	<div class="ol-split">
		<!-- Left: YAML -->
		<div class="ol-code">
			{#each lines as line, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="ol-line" class:show={i <= step} class:active={i === step} onclick={() => goTo(i)}>
					{#each line.tokens as t}
						<span class="ol-tok-{t.type}">{t.text}</span>
					{/each}
				</div>
			{/each}
		</div>

		<!-- Right: Index cards -->
		<div class="ol-cards">
			<div class="ol-cards-title">What YAML sees:</div>
			{#if visibleCards.length === 0}
				<div class="ol-cards-empty">List items will appear here as index cards...</div>
			{:else}
				{#each visibleCards as card, i}
					<div class="ol-card" class:building={i === visibleCards.length - 1 && step < 4 * (i + 1)} style="--card-color: {i === 0 ? '#0969a8' : '#7c3aed'}; animation-delay: {i * 0.1}s;">
						<div class="ol-card-idx">Item [{i}]</div>
						<div class="ol-card-row">
							<span class="ol-card-key">name:</span>
							<span class="ol-card-val str">{card.name}</span>
						</div>
						<div class="ol-card-row">
							<span class="ol-card-key">duration:</span>
							<span class="ol-card-val num">{card.duration}</span>
						</div>
						<div class="ol-card-row">
							<span class="ol-card-key">important:</span>
							<span class="ol-card-val bool">{card.important}</span>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Explain -->
	<div class="ol-explain">
		{#if step >= 0}
			{lines[step].explain}
		{:else}
			Click Next to build a list where each item has multiple fields — like a stack of index cards.
		{/if}
	</div>

	<div class="ol-footer">
		<div class="ol-controls">
			<button class="dbtn" onclick={() => goTo(step - 1)} disabled={step <= 0}>Back</button>
			<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= lines.length - 1}>
				{step >= lines.length - 1 ? 'Done ✓' : 'Next'}
			</button>
			<button class="dbtn" onclick={replay}>↻ Reset</button>
		</div>
	</div>
</div>

<style>
	.ol-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.ol-header { padding: 1.25rem 1.5rem 0.75rem; }
	.ol-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.ol-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.ol-split {
		display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
		margin: 0 1.5rem;
		background: var(--color-border); border-radius: 8px; overflow: hidden;
		height: 320px;
	}

	.ol-code {
		background: var(--color-bg-card); padding: 20px 24px;
		font-family: var(--font-mono); font-size: 0.82rem; line-height: 2.2;
		overflow: hidden;
		display: flex; flex-direction: column; justify-content: center;
	}

	.ol-line {
		opacity: 0; transition: opacity 0.4s ease;
		padding: 2px 6px; border-radius: 4px; cursor: pointer; white-space: pre; height: 2.2em;
	}
	.ol-line.show { opacity: 1; }
	.ol-line.active { background: var(--color-accent-bg); }
	.ol-line:hover { background: var(--color-bg-secondary); }
	.ol-line.active:hover { background: var(--color-accent-bg); }

	.ol-tok-key { color: #0969a8; font-weight: 600; }
	.ol-tok-colon { color: var(--color-text-muted); }
	.ol-tok-str { color: #1a7f37; }
	.ol-tok-num { color: #7c3aed; }
	.ol-tok-bool { color: #c45d2c; }
	.ol-tok-dash { color: #c45d2c; font-weight: 700; }
	.ol-tok-comment { color: #999; font-style: italic; }
	.ol-tok-indent { }

	.ol-cards {
		background: var(--color-bg-primary); padding: 20px 24px;
		overflow: hidden;
		display: flex; flex-direction: column; gap: 10px;
	}

	.ol-cards-title {
		font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600;
		text-transform: uppercase; letter-spacing: 0.06em;
		color: var(--color-text-muted);
	}

	.ol-cards-empty {
		font-family: var(--font-ui); font-size: 0.82rem; color: var(--color-text-muted);
	}

	.ol-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-left: 3px solid var(--card-color);
		border-radius: 0 8px 8px 0;
		padding: 12px 16px;
		animation: cardIn 0.3s ease forwards;
	}

	.ol-card-idx {
		font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600;
		color: var(--card-color); margin-bottom: 6px;
		text-transform: uppercase; letter-spacing: 0.04em;
	}

	.ol-card-row {
		display: flex; gap: 8px;
		font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.8;
	}

	.ol-card-key { color: #0969a8; font-weight: 600; }
	.ol-card-val.str { color: #1a7f37; }
	.ol-card-val.num { color: #7c3aed; }
	.ol-card-val.bool { color: #c45d2c; }

	.ol-explain {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary); border: 1px solid var(--color-border);
		border-radius: 8px; padding: 14px 18px;
		margin: 0.75rem 1.5rem; height: 80px; overflow-y: auto;
	}

	.ol-footer { padding: 0.75rem 1.5rem 1.25rem; }
	.ol-controls { display: flex; gap: 8px; }

	@keyframes cardIn {
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 600px) {
		.ol-split { grid-template-columns: 1fr; height: 550px; }
	}
</style>
