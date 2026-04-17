<script lang="ts">
	let step = $state(-1);

	interface Token {
		text: string;
		type: 'key' | 'colon' | 'str' | 'num' | 'bool' | 'comment' | 'indent';
	}

	function tok(text: string, type: Token['type']): Token {
		return { text, type };
	}

	interface Line {
		tokens: Token[];
		depth: number;
		treeLabel: string;
		explain: string;
	}

	const lines: Line[] = [
		{
			tokens: [tok('chip_design', 'key'), tok(':', 'colon')],
			depth: 0, treeLabel: 'chip_design',
			explain: 'This is the top-level container — like the label on a filing cabinet. It has no value after the colon, which means "look inside me for more information."'
		},
		{
			tokens: [tok('  ', 'indent'), tok('name', 'key'), tok(': ', 'colon'), tok('"My Chip"', 'str')],
			depth: 1, treeLabel: 'name: "My Chip"',
			explain: 'Indented 2 spaces — this belongs INSIDE chip_design. The 2 spaces tell YAML: "I am a child of the line above me." Like putting a folder inside the filing cabinet.'
		},
		{
			tokens: [tok('  ', 'indent'), tok('speed', 'key'), tok(': ', 'colon'), tok('100', 'num')],
			depth: 1, treeLabel: 'speed: 100',
			explain: 'Same 2-space indent as "name" — so this is a sibling (same level). Both name and speed live inside chip_design, like two folders side by side in the same drawer.'
		},
		{
			tokens: [tok('  ', 'indent'), tok('details', 'key'), tok(':', 'colon')],
			depth: 1, treeLabel: 'details',
			explain: 'Another child of chip_design — but notice: no value after the colon! This means "details" is a group that contains its own children. A drawer inside the filing cabinet.'
		},
		{
			tokens: [tok('    ', 'indent'), tok('size', 'key'), tok(': ', 'colon'), tok('"small"', 'str')],
			depth: 2, treeLabel: 'size: "small"',
			explain: 'Indented 4 spaces (2 more than "details"). This belongs INSIDE details. It is a grandchild of chip_design. Like a folder inside a drawer inside the cabinet.'
		},
		{
			tokens: [tok('    ', 'indent'), tok('power', 'key'), tok(': ', 'colon'), tok('"low"', 'str')],
			depth: 2, treeLabel: 'power: "low"',
			explain: 'Same 4-space indent as "size" — so these are siblings inside "details." The rule: same indent = same level. More indent = deeper nesting.'
		},
	];

	// Tree structure — spread out with more room
	const treeNodes = [
		{ id: 0, label: 'chip_design', parent: -1, x: 200, y: 30 },
		{ id: 1, label: 'name', parent: 0, x: 70, y: 110 },
		{ id: 2, label: 'speed', parent: 0, x: 200, y: 110 },
		{ id: 3, label: 'details', parent: 0, x: 330, y: 110 },
		{ id: 4, label: 'size', parent: 3, x: 280, y: 190 },
		{ id: 5, label: 'power', parent: 3, x: 380, y: 190 },
	];

	function goTo(idx: number) {
		step = Math.max(-1, Math.min(idx, lines.length - 1));
	}

	function replay() {
		step = -1;
	}

	let activeLine = $derived(step >= 0 ? lines[step] : null);
</script>

<div class="it-container">
	<div class="it-header">
		<h3>Interactive: Indentation = Nesting</h3>
		<p>Click Next to build a YAML structure — watch the tree grow on the right</p>
	</div>

	<div class="it-split">
		<!-- Left: YAML code -->
		<div class="it-code">
			{#each lines as line, i}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="it-line" class:show={i <= step} class:active={i === step} onclick={() => goTo(i)}>
					{#each line.tokens as t}
						<span class="it-tok-{t.type}">{t.text}</span>
					{/each}
					{#if i <= step}
						<span class="it-depth-badge">{line.depth === 0 ? 'root' : line.depth === 1 ? '2 spaces' : '4 spaces'}</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Right: Tree visualization -->
		<div class="it-tree">
			<svg viewBox="0 0 440 230" width="100%">
				<!-- Edges -->
				{#each treeNodes as node, i}
					{#if node.parent >= 0 && i <= step}
						{@const parent = treeNodes[node.parent]}
						<line
							x1={parent.x} y1={parent.y + 15}
							x2={node.x} y2={node.y - 13}
							stroke="#c4bfb5" stroke-width="1.5"
							opacity="0.6"
						/>
					{/if}
				{/each}

				<!-- Nodes -->
				{#each treeNodes as node, i}
					{@const visible = i <= step}
					{@const active = i === step}
					{@const isGroup = i === 0 || i === 3}
					<g style="opacity: {visible ? 1 : 0.08}; transition: opacity 0.4s ease;">
						<rect
							x={node.x - (isGroup ? 52 : 40)} y={node.y - 13}
							width={isGroup ? 104 : 80} height={28} rx="6"
							fill={active ? 'rgba(196,93,44,0.1)' : isGroup ? 'rgba(9,105,168,0.06)' : 'rgba(26,127,55,0.06)'}
							stroke={active ? '#c45d2c' : isGroup ? '#0969a8' : '#1a7f37'}
							stroke-width={active ? 1.5 : 1}
						/>
						<text
							x={node.x} y={node.y + 5}
							text-anchor="middle"
							fill={isGroup ? '#0969a8' : '#1a7f37'}
							font-size="11" font-weight="600" font-family="JetBrains Mono, monospace"
						>{node.label}</text>
					</g>
				{/each}
			</svg>
		</div>
	</div>

	<!-- Explain bar -->
	<div class="it-explain">
		{#if activeLine}
			{activeLine.explain}
		{:else}
			Click Next to start. YAML on the left, tree structure on the right — watch how indentation creates the hierarchy.
		{/if}
	</div>

	<div class="it-footer">
		<div class="it-controls">
			<button class="dbtn" onclick={() => goTo(step - 1)} disabled={step <= 0}>Back</button>
			<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= lines.length - 1}>
				{step >= lines.length - 1 ? 'Done ✓' : 'Next'}
			</button>
			<button class="dbtn" onclick={replay}>↻ Reset</button>
		</div>
	</div>
</div>

<style>
	.it-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2rem 0;
	}
	.it-header { padding: 1.25rem 1.5rem 0.5rem; }
	.it-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.it-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.it-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2px;
		margin: 0.75rem 1.5rem;
		background: var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		height: 320px;
	}
	.it-code {
		background: var(--color-bg-card);
		padding: 24px 24px;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		line-height: 2.4;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.it-line {
		opacity: 0; transition: opacity 0.4s ease;
		padding: 1px 4px; border-radius: 4px; cursor: pointer; white-space: pre; height: 2em;
		display: flex; align-items: center; gap: 8px;
	}
	.it-line.show { opacity: 1; }
	.it-line.active { background: var(--color-accent-bg); }
	.it-line:hover { background: var(--color-bg-secondary); }
	.it-line.active:hover { background: var(--color-accent-bg); }

	.it-depth-badge {
		font-family: var(--font-ui); font-size: 0.6rem; font-weight: 600;
		color: var(--color-text-muted); background: var(--color-bg-secondary);
		padding: 1px 6px; border-radius: 3px; white-space: nowrap;
	}

	.it-tok-key { color: #0969a8; font-weight: 600; }
	.it-tok-colon { color: var(--color-text-muted); }
	.it-tok-str { color: #1a7f37; }
	.it-tok-num { color: #7c3aed; }
	.it-tok-bool { color: #c45d2c; }
	.it-tok-comment { color: #999; font-style: italic; }
	.it-tok-indent { }

	.it-tree {
		background: var(--color-bg-primary);
		padding: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.it-explain {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary); border: 1px solid var(--color-border);
		border-radius: 8px; padding: 14px 18px;
		margin: 0.75rem 1.5rem; height: 90px; overflow-y: auto;
	}

	.it-footer { padding: 0.75rem 1.5rem 1.25rem; }
	.it-controls { display: flex; gap: 8px; }

	@media (max-width: 600px) {
		.it-split { grid-template-columns: 1fr; height: 400px; }
	}
</style>
