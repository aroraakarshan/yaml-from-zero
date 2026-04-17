<script lang="ts">
	let containerEl: HTMLDivElement;
	let step = $state(-1);

	interface Token {
		text: string;
		type: 'key' | 'colon' | 'space' | 'str' | 'num' | 'bool' | 'comment';
	}

	interface Step {
		// Which line index this step adds / highlights
		lineIdx: number;
		// Which token within that line to highlight (null = whole line)
		highlightToken: number | null;
		title: string;
		explain: string;
		color: string;
	}

	// The 3 lines we build up
	const yamlLines: Token[][] = [
		[
			{ text: 'chip_name', type: 'key' },
			{ text: ':', type: 'colon' },
			{ text: ' ', type: 'space' },
			{ text: '"My Processor"', type: 'str' },
		],
		[
			{ text: 'frequency', type: 'key' },
			{ text: ':', type: 'colon' },
			{ text: ' ', type: 'space' },
			{ text: '100', type: 'num' },
		],
		[
			{ text: 'debug_mode', type: 'key' },
			{ text: ':', type: 'colon' },
			{ text: ' ', type: 'space' },
			{ text: 'true', type: 'bool' },
		],
	];

	const steps: Step[] = [
		// Line 0 — string example
		{ lineIdx: 0, highlightToken: 0, title: 'The label (key)', explain: 'This is the label — it names the information. Like writing "Pizza size" on an order form. In YAML, labels are called "keys." They are always shown in blue.', color: '#0969a8' },
		{ lineIdx: 0, highlightToken: 1, title: 'The colon', explain: 'The colon separates the label from its value. Think of it as the word "is" — chip_name IS "My Processor."', color: '#888' },
		{ lineIdx: 0, highlightToken: 2, title: 'The mandatory space', explain: 'You MUST put a space after the colon. This is the #1 rule in YAML. Without this space, your file will not work. Every beginner forgets this at least once!', color: '#c45d2c' },
		{ lineIdx: 0, highlightToken: 3, title: 'The value (text)', explain: 'The value is the actual information. This one is text (a "string"), shown in green. We put it in quotes because it contains a space.', color: '#1a7f37' },
		// Line 1 — number example
		{ lineIdx: 1, highlightToken: 0, title: 'Another key', explain: 'A new label for different information. Notice the pattern is always the same: label, colon, space, value.', color: '#0969a8' },
		{ lineIdx: 1, highlightToken: 3, title: 'A number value', explain: 'This value is a number — shown in purple. No quotes needed! YAML automatically knows that 100 is a number. You can use whole numbers (100), decimals (1.2), or negatives (-25).', color: '#7c3aed' },
		// Line 2 — boolean example
		{ lineIdx: 2, highlightToken: 0, title: 'One more key', explain: 'Same pattern again — you are a pro at this now. Label on the left, value on the right.', color: '#0969a8' },
		{ lineIdx: 2, highlightToken: 3, title: 'A true/false value', explain: 'This is a boolean — like a light switch. It can only be true or false (always lowercase). Shown in terracotta. Use these for on/off settings.', color: '#c45d2c' },
	];

	function goTo(idx: number) {
		step = Math.max(0, Math.min(idx, steps.length - 1));
	}

	function replay() {
		step = -1;
	}

	// Which lines are visible so far
	let visibleUpToLine = $derived(step >= 0 ? steps[step].lineIdx : -1);
	let activeStep = $derived(step >= 0 ? steps[step] : null);

	const tokenColors: Record<string, string> = {
		key: '#0969a8',
		colon: '#888',
		space: 'transparent',
		str: '#1a7f37',
		num: '#7c3aed',
		bool: '#c45d2c',
		comment: '#999',
	};
</script>

<div class="kvb-container" bind:this={containerEl}>
	<div class="kvb-header">
		<h3>Interactive: Anatomy of a YAML Pair</h3>
		<p>Watch three lines being built — each part is color-coded and explained</p>
	</div>

	<div class="kvb-split">
		<!-- Left: YAML code -->
		<div class="kvb-code">
			{#each yamlLines as line, lineIdx}
				<div class="kvb-line" class:visible={lineIdx <= visibleUpToLine}>
					{#each line as tok, tokIdx}
						{@const isHighlighted = activeStep && activeStep.lineIdx === lineIdx && activeStep.highlightToken === tokIdx}
						<span
							class="kvb-tok"
							class:highlight={isHighlighted}
							style="color: {tokenColors[tok.type]}; {tok.type === 'space' ? 'background: ' + (isHighlighted ? 'rgba(196,93,44,0.25)' : 'transparent') + '; min-width: 0.6em; display: inline-block;' : ''} {tok.type === 'key' ? 'font-weight: 600;' : ''}"
						>{tok.text}</span>
					{/each}
				</div>
			{/each}
		</div>

		<!-- Right: Explanation -->
		<div class="kvb-explain">
			{#if activeStep}
				<div class="kvb-explain-badge" style="background: {activeStep.color}20; color: {activeStep.color}; border-color: {activeStep.color};">
					{activeStep.title}
				</div>
				<p class="kvb-explain-text">{activeStep.explain}</p>
			{:else}
				<p class="kvb-explain-text" style="color: var(--color-text-muted);">
					The YAML will build up on the left, piece by piece. Each colored part is explained here.
				</p>
			{/if}
		</div>
	</div>

	<!-- Controls -->
	<div class="kvb-footer">
		<div class="kvb-progress">
			{#each steps as _, i}
				<button
					class="kvb-dot"
					class:active={i === step}
					class:done={i < step}
					onclick={() => goTo(i)}
					aria-label="Step {i + 1}"
				></button>
			{/each}
		</div>
		<div class="kvb-controls">
			<button class="dbtn" onclick={() => goTo(step - 1)} disabled={step <= 0}>Back</button>
			<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= steps.length - 1}>
				{step >= steps.length - 1 ? 'Done ✓' : 'Next'}
			</button>
			<button class="dbtn" onclick={replay}>↻ Replay</button>
		</div>
	</div>
</div>

<style>
	.kvb-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2rem 0;
	}

	.kvb-header {
		padding: 1.25rem 1.5rem 0.5rem;
	}

	.kvb-header h3 {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.3rem;
	}

	.kvb-header p {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.kvb-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px;
		margin: 0.75rem 1.5rem;
		background: var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		height: 200px;
	}

	.kvb-code {
		background: var(--color-bg-card);
		padding: 20px 24px;
		font-family: var(--font-mono);
		font-size: 0.9rem;
		line-height: 2.2;
		overflow: hidden;
	}

	.kvb-line {
		opacity: 0;
		transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		white-space: pre;
		height: 2.2em;
	}

	.kvb-line.visible {
		opacity: 1;
	}

	.kvb-tok {
		transition: all 0.3s ease;
		border-radius: 3px;
		padding: 1px 0;
	}

	.kvb-tok.highlight {
		background: rgba(196, 93, 44, 0.08);
		padding: 1px 3px;
		margin: 0 -3px;
	}

	.kvb-explain {
		background: var(--color-bg-primary);
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow-y: auto;
	}

	.kvb-explain-badge {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		border: 1px solid;
		border-radius: 4px;
		padding: 3px 10px;
		display: inline-block;
		width: fit-content;
		margin-bottom: 8px;
	}

	.kvb-explain-text {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.kvb-footer {
		padding: 0.75rem 1.5rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.kvb-progress {
		display: flex;
		gap: 5px;
	}

	.kvb-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		border: 1.5px solid var(--color-border);
		background: transparent;
		padding: 0;
		cursor: pointer;
		transition: all 0.2s;
	}

	.kvb-dot.active {
		background: var(--color-accent);
		border-color: var(--color-accent);
	}

	.kvb-dot.done {
		background: var(--color-border-hover);
		border-color: var(--color-border-hover);
	}

	.kvb-controls {
		display: flex;
		gap: 8px;
	}

	@media (max-width: 600px) {
		.kvb-split {
			grid-template-columns: 1fr;
		}
	}
</style>
