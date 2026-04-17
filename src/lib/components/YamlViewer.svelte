<script lang="ts">
	interface Token {
		text: string;
		type: 'key' | 'colon' | 'str' | 'num' | 'bool' | 'comment' | 'dash';
	}

	interface YamlLine {
		indent: number;
		tokens: Token[];
	}

	let { lines, showGuides = true }: { lines: YamlLine[]; showGuides?: boolean } = $props();
</script>

<div class="yv-block">
	{#each lines as line}
		<div class="yv-line">
			<!-- Indentation with visible dots -->
			{#if line.indent > 0}
				<span class="yv-indent">
					{#each Array(line.indent) as _, i}
						{#if showGuides}
							<span class="yv-dot" class:guide={i % 2 === 1}>·</span>
						{:else}
							<span class="yv-space">&nbsp;</span>
						{/if}
					{/each}
				</span>
			{/if}
			<!-- Tokens -->
			{#each line.tokens as tok}
				<span class="yv-{tok.type}">{tok.text}</span>
			{/each}
		</div>
	{/each}

	{#if showGuides}
		<div class="yv-legend">
			<span class="yv-legend-dot">·</span> = one space
		</div>
	{/if}
</div>

<style>
	.yv-block {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		line-height: 2.2;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 20px 24px;
		margin: 1.5rem 0;
		overflow-x: auto;
	}

	.yv-line {
		white-space: pre;
	}

	.yv-indent {
		/* Keep spaces visible */
	}

	.yv-dot {
		color: var(--color-border-hover);
		font-size: 1em;
		letter-spacing: 0;
	}

	.yv-dot.guide {
		color: var(--color-accent);
		opacity: 0.4;
	}

	.yv-space {
		/* invisible space */
	}

	.yv-key { color: #0969a8; font-weight: 600; }
	.yv-colon { color: var(--color-text-muted); }
	.yv-str { color: #1a7f37; }
	.yv-num { color: #7c3aed; }
	.yv-bool { color: #c45d2c; }
	.yv-comment { color: #999; font-style: italic; }
	.yv-dash { color: #c45d2c; font-weight: 700; }

	.yv-legend {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--color-border);
		font-family: var(--font-ui);
		font-size: 0.72rem;
		color: var(--color-text-muted);
	}

	.yv-legend-dot {
		color: var(--color-border-hover);
		font-family: var(--font-mono);
		font-size: 0.85rem;
	}
</style>
