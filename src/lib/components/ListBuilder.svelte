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
	}

	const lines: Line[] = [
		{
			tokens: [tok('# Things to test in my chip', 'comment')],
			explain: 'A comment describing what this section is for. Remember, comments start with # and are just notes for humans.'
		},
		{
			tokens: [tok('tests_to_run', 'key'), tok(':', 'colon')],
			explain: 'The label for our list. Notice there is nothing after the colon — that means "the value is below me." In this case, the value will be a list of items.'
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('"basic_operations"', 'str')],
			explain: 'The first list item! The dash (-) followed by a space means "this is one item in the list." It is like one bullet point in a bullet-point list. The item is indented under tests_to_run because it belongs to that list.'
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('"speed_test"', 'str')],
			explain: 'The second list item. Same indent, same dash — YAML knows this is another item in the same list. Order matters: YAML remembers the order you write items.'
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('"power_test"', 'str')],
			explain: 'Third item. You can have as many items as you want — just keep using dashes at the same indent level. Each dash = one item.'
		},
		{
			tokens: [tok('  ', 'indent'), tok('- ', 'dash'), tok('"temperature_test"', 'str')],
			explain: 'Fourth item. That is it — four tests in our list! In a programming language, this would look like ["basic_operations", "speed_test", "power_test", "temperature_test"]. The YAML version is much easier to read.'
		},
	];

	// Visual list representation
	let visibleItems = $derived(
		step <= 1 ? [] :
		lines.slice(2, step + 1).map((l) => {
			const strTok = l.tokens.find(t => t.type === 'str');
			return strTok?.text.replace(/"/g, '') ?? '';
		})
	);

	function goTo(idx: number) {
		step = Math.max(-1, Math.min(idx, lines.length - 1));
	}

	function replay() { step = -1; }
</script>

<div class="lb-container">
	<div class="lb-header">
		<h3>Interactive: Making a List</h3>
		<p>Click Next to see how dashes create a list — like writing bullet points</p>
	</div>

	<div class="lb-split">
		<!-- Left: YAML code -->
		<div class="lb-code">
			{#each lines as line, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="lb-line" class:show={i <= step} class:active={i === step} onclick={() => goTo(i)}>
					{#each line.tokens as t}
						<span class="lb-tok-{t.type}">{t.text}</span>
					{/each}
				</div>
			{/each}
		</div>

		<!-- Right: Visual list -->
		<div class="lb-visual">
			<div class="lb-visual-title">What YAML sees:</div>
			{#if visibleItems.length === 0}
				<div class="lb-visual-empty">List items will appear here...</div>
			{:else}
				<div class="lb-visual-list">
					{#each visibleItems as item, i}
						<div class="lb-visual-item" style="animation-delay: {i * 0.05}s;">
							<span class="lb-visual-idx">{i}</span>
							<span class="lb-visual-val">{item}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<!-- Explain -->
	<div class="lb-explain">
		{#if step >= 0}
			{lines[step].explain}
		{:else}
			Click Next to start building a YAML list step by step.
		{/if}
	</div>

	<div class="lb-footer">
		<div class="lb-controls">
			<button class="dbtn" onclick={() => goTo(step - 1)} disabled={step <= 0}>Back</button>
			<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= lines.length - 1}>
				{step >= lines.length - 1 ? 'Done ✓' : 'Next'}
			</button>
			<button class="dbtn" onclick={replay}>↻ Reset</button>
		</div>
	</div>
</div>

<style>
	.lb-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2rem 0;
	}
	.lb-header { padding: 1.25rem 1.5rem 0.5rem; }
	.lb-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.lb-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.lb-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px;
		margin: 0.75rem 1.5rem;
		background: var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		height: 280px;
	}

	.lb-code {
		background: var(--color-bg-card);
		padding: 16px 20px;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		line-height: 2;
		overflow: hidden;
	}

	.lb-line {
		opacity: 0; transition: opacity 0.4s ease;
		padding: 1px 4px; border-radius: 4px; cursor: pointer; white-space: pre; height: 2em;
	}
	.lb-line.show { opacity: 1; }
	.lb-line.active { background: var(--color-accent-bg); }
	.lb-line:hover { background: var(--color-bg-secondary); }
	.lb-line.active:hover { background: var(--color-accent-bg); }

	.lb-tok-key { color: #0969a8; font-weight: 600; }
	.lb-tok-colon { color: var(--color-text-muted); }
	.lb-tok-str { color: #1a7f37; }
	.lb-tok-num { color: #7c3aed; }
	.lb-tok-bool { color: #c45d2c; }
	.lb-tok-dash { color: #c45d2c; font-weight: 700; }
	.lb-tok-comment { color: #999; font-style: italic; }
	.lb-tok-indent { }

	.lb-visual {
		background: var(--color-bg-primary);
		padding: 16px 20px;
		overflow: hidden;
	}
	.lb-visual-title {
		font-family: var(--font-ui); font-size: 0.7rem; font-weight: 600;
		text-transform: uppercase; letter-spacing: 0.06em;
		color: var(--color-text-muted); margin-bottom: 10px;
	}
	.lb-visual-empty {
		font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted);
	}
	.lb-visual-list { display: flex; flex-direction: column; gap: 6px; }
	.lb-visual-item {
		display: flex; align-items: center; gap: 10px;
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		border-radius: 6px; padding: 6px 12px;
		animation: slideIn 0.3s ease forwards;
	}
	.lb-visual-idx {
		font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600;
		color: var(--color-text-muted); min-width: 14px;
	}
	.lb-visual-val {
		font-family: var(--font-mono); font-size: 0.78rem; color: #1a7f37;
	}

	.lb-explain {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary); border: 1px solid var(--color-border);
		border-radius: 8px; padding: 14px 18px;
		margin: 0.75rem 1.5rem; height: 100px; overflow-y: auto;
	}

	.lb-footer { padding: 0.75rem 1.5rem 1.25rem; }
	.lb-controls { display: flex; gap: 8px; }

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(-8px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@media (max-width: 600px) {
		.lb-split { grid-template-columns: 1fr; height: 400px; }
	}
</style>
