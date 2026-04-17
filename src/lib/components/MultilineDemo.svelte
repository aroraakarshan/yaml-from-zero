<script lang="ts">
	let mode = $state<'pipe' | 'fold'>('pipe');

	const inputText = `This is my first project.
I am learning chip design.

It will take 6 months.`;

	let outputText = $derived(
		mode === 'pipe'
			? inputText
			: inputText.replace(/\n\n/g, '\n\n').replace(/(?<!\n)\n(?!\n)/g, ' ')
	);

	const yamlPipe = `description: |
  This is my first project.
  I am learning chip design.

  It will take 6 months.`;

	const yamlFold = `description: >
  This is my first project.
  I am learning chip design.

  It will take 6 months.`;
</script>

<div class="ml-container">
	<div class="ml-header">
		<h3>Interactive: Pipe vs Fold</h3>
		<p>Toggle between | and > to see how YAML treats the same text</p>
	</div>

	<div class="ml-toggle">
		<button class="ml-btn" class:active={mode === 'pipe'} onclick={() => (mode = 'pipe')}>
			<code>|</code> Pipe (keep line breaks)
		</button>
		<button class="ml-btn" class:active={mode === 'fold'} onclick={() => (mode = 'fold')}>
			<code>></code> Fold (join into one line)
		</button>
	</div>

	<div class="ml-split">
		<div class="ml-pane">
			<div class="ml-pane-label">What you write in YAML</div>
			<pre class="ml-code">{mode === 'pipe' ? yamlPipe : yamlFold}</pre>
		</div>
		<div class="ml-pane">
			<div class="ml-pane-label">What the computer reads</div>
			<div class="ml-output">
				{#if mode === 'pipe'}
					{#each outputText.split('\n') as line, i}
						<div class="ml-output-line">{line || '\u00A0'}</div>
					{/each}
					<div class="ml-badge pipe">Line breaks preserved ✓</div>
				{:else}
					<div class="ml-output-line">{outputText}</div>
					<div class="ml-badge fold">Folded into one paragraph ✓</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.ml-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.ml-header { padding: 1.25rem 1.5rem 0.5rem; }
	.ml-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.ml-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.ml-toggle {
		display: flex; gap: 8px; padding: 0.5rem 1.5rem;
	}
	.ml-btn {
		flex: 1; padding: 10px 16px;
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		border-radius: 8px; cursor: pointer;
		font-family: var(--font-ui); font-size: 0.82rem; font-weight: 500;
		color: var(--color-text-muted); transition: all 0.2s;
		display: flex; align-items: center; gap: 8px;
	}
	.ml-btn code {
		font-family: var(--font-mono); font-size: 1rem; font-weight: 700;
		background: none; padding: 0; color: inherit;
	}
	.ml-btn:hover { border-color: var(--color-border-hover); color: var(--color-text-secondary); }
	.ml-btn.active {
		border-color: var(--color-accent); color: var(--color-accent);
		background: var(--color-accent-bg);
	}

	.ml-split {
		display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
		margin: 0.5rem 1.5rem 1.25rem;
		background: var(--color-border); border-radius: 8px; overflow: hidden;
		height: 220px;
	}
	.ml-pane {
		background: var(--color-bg-card); padding: 12px 16px; overflow-y: auto;
	}
	.ml-pane-label {
		font-family: var(--font-ui); font-size: 0.68rem; font-weight: 600;
		text-transform: uppercase; letter-spacing: 0.06em;
		color: var(--color-text-muted); margin-bottom: 8px;
	}
	.ml-code {
		font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.8;
		color: var(--color-text-primary); white-space: pre-wrap;
		margin: 0; padding: 0; background: none; border: none;
	}
	.ml-output {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary);
	}
	.ml-output-line { min-height: 1.4em; }
	.ml-badge {
		margin-top: 12px; font-family: var(--font-ui); font-size: 0.72rem; font-weight: 600;
		padding: 4px 10px; border-radius: 4px; display: inline-block;
	}
	.ml-badge.pipe { background: rgba(9,105,168,0.08); color: #0969a8; }
	.ml-badge.fold { background: rgba(196,93,44,0.08); color: #c45d2c; }

	@media (max-width: 600px) {
		.ml-split { grid-template-columns: 1fr; height: 360px; }
	}
</style>
