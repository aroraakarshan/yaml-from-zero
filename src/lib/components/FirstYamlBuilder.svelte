<script lang="ts">
	import { onMount } from 'svelte';

	let containerEl: HTMLDivElement;
	let step = $state(-1);
	let started = false;
	let flowing = $state(false);
	let timer: ReturnType<typeof setInterval> | null = null;

	interface Token {
		text: string;
		type: 'key' | 'colon' | 'str' | 'num' | 'bool' | 'comment' | 'indent';
	}

	interface Line {
		tokens: Token[];
		explain: string;
	}

	function tok(text: string, type: Token['type']): Token {
		return { text, type };
	}

	const lines: Line[] = [
		{
			tokens: [tok('# My First Semiconductor Design', 'comment')],
			explain: 'This line starts with #, so it is a comment. The computer ignores it completely. It is a note for you — like writing a title on top of a recipe card.'
		},
		{
			tokens: [tok('project_name', 'key'), tok(': ', 'colon'), tok('"Learning Processor"', 'str')],
			explain: 'This is your first piece of information! On the left of the colon is the label (project_name). On the right is the value ("Learning Processor"). It is like writing "Pizza size: Large" on an order form.'
		},
		{
			tokens: [tok('version', 'key'), tok(': ', 'colon'), tok('"1.0"', 'str')],
			explain: 'Another label and value. We put "1.0" in quotes because we want it treated as text, not as a math number. Without quotes, YAML might think it is just the number 1.'
		},
		{
			tokens: [tok('date_created', 'key'), tok(': ', 'colon'), tok('"2024-01-15"', 'str')],
			explain: 'Dates always go in quotes. If you wrote 2024-01-15 without quotes, YAML would try to interpret it as a date object instead of simple text. Quotes keep it safe.'
		},
		{
			tokens: [tok('', 'indent')],
			explain: 'This is just a blank line. YAML does not care about blank lines — they are ignored. But they make your file easier to read, like paragraph breaks in a letter.'
		},
		{
			tokens: [tok('# Technical specifications', 'comment')],
			explain: 'Another comment — this one labels the next group of settings. Good habit: use comments to organize your file into sections, like chapters in a book.'
		},
		{
			tokens: [tok('frequency_mhz', 'key'), tok(': ', 'colon'), tok('100', 'num')],
			explain: 'This value is a number — no quotes needed! YAML sees 100 and knows it is a whole number (integer). You can do math with it if a tool needs to.'
		},
		{
			tokens: [tok('voltage_volts', 'key'), tok(': ', 'colon'), tok('1.2', 'num')],
			explain: 'A decimal number. YAML handles whole numbers (100) and decimal numbers (1.2) the same way — just type the number, no quotes.'
		},
		{
			tokens: [tok('low_power_mode', 'key'), tok(': ', 'colon'), tok('true', 'bool')],
			explain: 'This is a true/false value (called a "boolean"). It is like a light switch — either on (true) or off (false). Always use lowercase: true, not True or TRUE.'
		},
	];

	function startFlow() {
		flowing = true;
		step = 0;
		timer = setInterval(() => {
			if (step >= lines.length - 1) {
				if (timer) clearInterval(timer);
				flowing = false;
			} else {
				step++;
			}
		}, 2400);
	}

	function goTo(idx: number) {
		if (timer) clearInterval(timer);
		flowing = false;
		step = Math.max(-1, Math.min(idx, lines.length - 1));
	}

	function replay() {
		if (timer) clearInterval(timer);
		step = -1;
		setTimeout(startFlow, 300);
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !started) {
					started = true;
					startFlow();
				}
			},
			{ root: document.getElementById('main-scroll'), threshold: 0.3 }
		);
		observer.observe(containerEl);
		return () => {
			observer.disconnect();
			if (timer) clearInterval(timer);
		};
	});

	let activeLine = $derived(step >= 0 && step < lines.length ? lines[step] : null);
</script>

<div class="fyb-container" bind:this={containerEl}>
	<div class="fyb-header">
		<h3>Interactive: Building a YAML File Line by Line</h3>
		<p>Click Next to add lines — click any line to read what it does in plain English</p>
	</div>

	<!-- Fixed-height split: code left, explain right -->
	<div class="fyb-split">
		<div class="fyb-code">
			{#each lines as line, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fyb-line"
					class:show={i <= step}
					class:active={i === step}
					onclick={() => goTo(i)}
				>
					{#each line.tokens as tok}
						<span class="fyb-tok-{tok.type}">{tok.text || '\u00A0'}</span>
					{/each}
				</div>
			{/each}
		</div>

		<div class="fyb-explain">
			{#if activeLine}
				<div class="fyb-explain-badge" style="color: var(--color-accent);">
					Line {step + 1} of {lines.length}
				</div>
				<p class="fyb-explain-text">{activeLine.explain}</p>
			{:else}
				<p class="fyb-explain-text" style="color: var(--color-text-muted);">
					Click Next to start building the file. Each line is explained here.
				</p>
			{/if}
		</div>
	</div>

	<!-- Controls — always at the same position -->
	<div class="fyb-footer">
		<div class="fyb-progress">
			<div class="fyb-progress-track">
				<div class="fyb-progress-fill" style="width: {((step + 1) / lines.length) * 100}%;"></div>
			</div>
			<span class="fyb-progress-label">{Math.max(0, step + 1)} / {lines.length}</span>
		</div>
		<div class="fyb-controls">
			<button class="dbtn" onclick={() => goTo(step - 1)} disabled={step <= 0}>Back</button>
			<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= lines.length - 1}>
				{step >= lines.length - 1 ? 'Done ✓' : 'Next'}
			</button>
			<button class="dbtn" onclick={replay}>↻ Reset</button>
		</div>
	</div>
</div>

<style>
	.fyb-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2rem 0;
	}

	.fyb-header {
		padding: 1.25rem 1.5rem 0.5rem;
	}

	.fyb-header h3 {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.3rem;
	}

	.fyb-header p {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	/* Fixed-height two-column split — nothing below can shift */
	.fyb-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px;
		margin: 0.75rem 1.5rem;
		background: var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		height: 300px;
	}

	.fyb-code {
		background: var(--color-bg-card);
		padding: 16px 20px;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		line-height: 2;
		overflow: hidden;
	}

	.fyb-line {
		opacity: 0;
		transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
		padding: 1px 6px;
		border-radius: 4px;
		cursor: pointer;
		white-space: pre;
		height: 2em;
	}

	.fyb-line.show {
		opacity: 1;
	}

	.fyb-line.active {
		background: var(--color-accent-bg);
	}

	.fyb-line:hover {
		background: var(--color-bg-secondary);
	}

	.fyb-line.active:hover {
		background: var(--color-accent-bg);
	}

	/* Token colors matching theme */
	.fyb-tok-key { color: #0969a8; font-weight: 600; }
	.fyb-tok-colon { color: var(--color-text-muted); }
	.fyb-tok-str { color: #1a7f37; }
	.fyb-tok-num { color: #7c3aed; }
	.fyb-tok-bool { color: #c45d2c; }
	.fyb-tok-comment { color: #999; font-style: italic; }
	.fyb-tok-indent { /* invisible */ }

	.fyb-explain {
		background: var(--color-bg-primary);
		padding: 20px 24px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		overflow-y: auto;
	}

	.fyb-explain-badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		font-weight: 600;
		margin-bottom: 8px;
	}

	.fyb-explain-text {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* Footer: progress + controls — always at same position */
	.fyb-footer {
		padding: 0.75rem 1.5rem 1.25rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.fyb-progress {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1;
	}

	.fyb-progress-track {
		flex: 1;
		height: 4px;
		background: var(--color-bg-tertiary);
		border-radius: 2px;
		overflow: hidden;
	}

	.fyb-progress-fill {
		height: 100%;
		background: var(--color-accent);
		border-radius: 2px;
		transition: width 0.4s ease;
	}

	.fyb-progress-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--color-text-muted);
		white-space: nowrap;
	}

	.fyb-controls {
		display: flex;
		gap: 8px;
	}

	@media (max-width: 600px) {
		.fyb-split {
			grid-template-columns: 1fr;
			height: 500px;
		}
	}
</style>
