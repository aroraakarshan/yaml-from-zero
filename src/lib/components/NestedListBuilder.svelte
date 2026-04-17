<script lang="ts">
	let step = $state(-1);

	interface Token {
		text: string;
		type: 'key' | 'colon' | 'str' | 'num' | 'bool' | 'indent' | 'dash' | 'comment';
	}

	function tok(text: string, type: Token['type']): Token {
		return { text, type };
	}

	interface Line {
		tokens: Token[];
		explain: string;
		cardIdx: number;
		depth: number;
	}

	const lines: Line[] = [
		{
			tokens: [tok('test_list', 'key'), tok(':', 'colon')],
			explain: 'The parent label. Nothing after the colon — the list items are below.',
			cardIdx: -1, depth: 0,
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('name', 'key'), tok(': ', 'colon'), tok('"power_test"', 'str')],
			explain: 'Dash = new list item (item #1). The first field is "name." Think of the dash as starting a new index card.',
			cardIdx: 0, depth: 1,
		},
		{
			tokens: [tok('    ', 'indent'), tok('duration', 'key'), tok(': ', 'colon'), tok('30', 'num')],
			explain: 'No dash — same item. "duration" is the second field on card #1.',
			cardIdx: 0, depth: 2,
		},
		{
			tokens: [tok('    ', 'indent'), tok('settings', 'key'), tok(':', 'colon')],
			explain: 'Still card #1, but this field has NO value after the colon. That means "settings" is a nested group INSIDE this list item — a group inside a card!',
			cardIdx: 0, depth: 2,
		},
		{
			tokens: [tok('      ', 'indent'), tok('voltage', 'key'), tok(': ', 'colon'), tok('1.2', 'num')],
			explain: 'Indented 6 spaces — this belongs inside "settings," which belongs inside item #1. Three levels deep: test_list → item → settings → voltage.',
			cardIdx: 0, depth: 3,
		},
		{
			tokens: [tok('      ', 'indent'), tok('temperature', 'key'), tok(': ', 'colon'), tok('85', 'num')],
			explain: 'Same 6-space indent = sibling of "voltage," both inside "settings." The card now has: name, duration, and a whole settings group.',
			cardIdx: 0, depth: 3,
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('name', 'key'), tok(': ', 'colon'), tok('"speed_test"', 'str')],
			explain: 'New dash back at 2 spaces = NEW list item! Card #2 starts here. The previous card (with its nested settings) is complete.',
			cardIdx: 1, depth: 1,
		},
		{
			tokens: [tok('    ', 'indent'), tok('duration', 'key'), tok(': ', 'colon'), tok('15', 'num')],
			explain: 'No dash — belongs to card #2. This item is simpler: just name and duration, no nested settings. Items in the same list can have different structures.',
			cardIdx: 1, depth: 2,
		},
	];

	// Build cards for the right side
	interface CardField {
		label: string;
		value: string;
		type: 'str' | 'num' | 'bool';
		indent: number;
		isGroup: boolean;
	}

	interface Card {
		fields: CardField[];
	}

	function getCards(): Card[] {
		const cards: Card[] = [];

		// Card 0
		const c0: CardField[] = [];
		if (step >= 1) c0.push({ label: 'name', value: '"power_test"', type: 'str', indent: 0, isGroup: false });
		if (step >= 2) c0.push({ label: 'duration', value: '30', type: 'num', indent: 0, isGroup: false });
		if (step >= 3) c0.push({ label: 'settings', value: '', type: 'str', indent: 0, isGroup: true });
		if (step >= 4) c0.push({ label: 'voltage', value: '1.2', type: 'num', indent: 1, isGroup: false });
		if (step >= 5) c0.push({ label: 'temperature', value: '85', type: 'num', indent: 1, isGroup: false });
		if (c0.length > 0) cards.push({ fields: c0 });

		// Card 1
		const c1: CardField[] = [];
		if (step >= 6) c1.push({ label: 'name', value: '"speed_test"', type: 'str', indent: 0, isGroup: false });
		if (step >= 7) c1.push({ label: 'duration', value: '15', type: 'num', indent: 0, isGroup: false });
		if (c1.length > 0) cards.push({ fields: c1 });

		return cards;
	}

	let cards = $derived(getCards());

	const typeColor: Record<string, string> = { str: '#1a7f37', num: '#7c3aed', bool: '#c45d2c' };
	const cardColors = ['#0969a8', '#b45309'];

	function goTo(idx: number) {
		step = Math.max(-1, Math.min(idx, lines.length - 1));
	}
	function replay() { step = -1; }
</script>

<div class="nl-container">
	<div class="nl-header">
		<h3>Interactive: Nested Objects in a List</h3>
		<p>Click Next — each list item can contain key-value pairs AND nested groups inside it</p>
	</div>

	<div class="nl-split">
		<!-- Left: YAML -->
		<div class="nl-code">
			{#each lines as line, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="nl-line" class:show={i <= step} class:active={i === step} onclick={() => goTo(i)}>
					{#each line.tokens as t}
						<span class="nl-tok-{t.type}">{t.text}</span>
					{/each}
				</div>
			{/each}
		</div>

		<!-- Right: Cards -->
		<div class="nl-cards">
			<div class="nl-cards-title">Parsed structure:</div>
			{#if cards.length === 0}
				<div class="nl-cards-empty">Items will appear as cards...</div>
			{:else}
				{#each cards as card, ci}
					<div class="nl-card" style="--card-color: {cardColors[ci]};">
						<div class="nl-card-idx">Item [{ci}]</div>
						{#each card.fields as field, fi}
							<div class="nl-card-row" style="padding-left: {field.indent * 16}px; animation-delay: {fi * 0.04}s;">
								{#if field.isGroup}
									<span class="nl-card-key">{field.label}:</span>
									<span class="nl-card-badge">group ↓</span>
								{:else}
									<span class="nl-card-key">{field.label}:</span>
									<span class="nl-card-val" style="color: {typeColor[field.type]};">{field.value}</span>
								{/if}
							</div>
						{/each}
					</div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Explain -->
	<div class="nl-explain">
		{#if step >= 0}
			{lines[step].explain}
		{:else}
			Click Next to build a list where each item has nested groups inside it — the most complex YAML pattern.
		{/if}
	</div>

	<div class="nl-footer">
		<div class="nl-controls">
			<button class="dbtn" onclick={() => goTo(step - 1)} disabled={step <= 0}>Back</button>
			<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= lines.length - 1}>
				{step >= lines.length - 1 ? 'Done ✓' : 'Next'}
			</button>
			<button class="dbtn" onclick={replay}>↻ Reset</button>
		</div>
	</div>
</div>

<style>
	.nl-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.nl-header { padding: 1.25rem 1.5rem 0.75rem; }
	.nl-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.nl-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.nl-split {
		display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
		margin: 0 1.5rem; background: var(--color-border);
		border-radius: 8px; overflow: hidden; height: 360px;
	}

	.nl-code {
		background: var(--color-bg-card); padding: 20px 24px;
		font-family: var(--font-mono); font-size: 0.82rem; line-height: 2.2;
		overflow: hidden; display: flex; flex-direction: column; justify-content: center;
	}

	.nl-line {
		opacity: 0; transition: opacity 0.4s ease;
		padding: 2px 6px; border-radius: 4px; cursor: pointer; white-space: pre; height: 2.2em;
	}
	.nl-line.show { opacity: 1; }
	.nl-line.active { background: var(--color-accent-bg); }
	.nl-line:hover { background: var(--color-bg-secondary); }
	.nl-line.active:hover { background: var(--color-accent-bg); }

	.nl-tok-key { color: #0969a8; font-weight: 600; }
	.nl-tok-colon { color: var(--color-text-muted); }
	.nl-tok-str { color: #1a7f37; }
	.nl-tok-num { color: #7c3aed; }
	.nl-tok-bool { color: #c45d2c; }
	.nl-tok-dash { color: #c45d2c; font-weight: 700; }
	.nl-tok-comment { color: #999; font-style: italic; }
	.nl-tok-indent { }

	.nl-cards {
		background: var(--color-bg-primary); padding: 20px 24px;
		overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
	}
	.nl-cards-title {
		font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600;
		text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted);
	}
	.nl-cards-empty {
		font-family: var(--font-ui); font-size: 0.82rem; color: var(--color-text-muted);
	}

	.nl-card {
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		border-left: 3px solid var(--card-color);
		border-radius: 0 8px 8px 0; padding: 12px 16px;
	}
	.nl-card-idx {
		font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600;
		color: var(--card-color); margin-bottom: 6px;
		text-transform: uppercase; letter-spacing: 0.04em;
	}
	.nl-card-row {
		display: flex; gap: 8px; align-items: center;
		font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.8;
		animation: rowIn 0.25s ease forwards; opacity: 0;
	}
	.nl-card-key { color: #0969a8; font-weight: 600; }
	.nl-card-badge {
		font-family: var(--font-ui); font-size: 0.6rem; font-weight: 600;
		color: var(--color-text-muted); background: var(--color-bg-secondary);
		padding: 1px 6px; border-radius: 3px;
	}

	.nl-explain {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary); border: 1px solid var(--color-border);
		border-radius: 8px; padding: 14px 18px;
		margin: 0.75rem 1.5rem; height: 100px; overflow-y: auto;
	}

	.nl-footer { padding: 0.75rem 1.5rem 1.25rem; }
	.nl-controls { display: flex; gap: 8px; }

	@keyframes rowIn {
		from { opacity: 0; transform: translateX(-6px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@media (max-width: 600px) {
		.nl-split { grid-template-columns: 1fr; height: 600px; }
	}
</style>
