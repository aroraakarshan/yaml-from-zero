<script lang="ts">
	let activeCard = $state(0);
	let showAnnotations = $state(true);

	interface Token {
		text: string;
		type: 'key' | 'colon' | 'str' | 'num' | 'bool' | 'dash' | 'indent' | 'comment';
	}

	interface YamlLine {
		tokens: Token[];
		annotation: string;
	}

	// Tokenizer: splits a yaml string into colored tokens
	function tokenize(yaml: string): Token[] {
		const tokens: Token[] = [];

		// Leading whitespace
		const indentMatch = yaml.match(/^(\s+)/);
		if (indentMatch) {
			tokens.push({ text: indentMatch[1], type: 'indent' });
			yaml = yaml.slice(indentMatch[1].length);
		}

		// Dash (list item)
		if (yaml.startsWith('- ')) {
			tokens.push({ text: '- ', type: 'dash' });
			yaml = yaml.slice(2);
			// Remaining could be a value
			tokens.push(...tokenizeValue(yaml));
			return tokens;
		}

		// Key: value
		const kvMatch = yaml.match(/^([^:]+):(.*)/);
		if (kvMatch) {
			tokens.push({ text: kvMatch[1], type: 'key' });
			tokens.push({ text: ':', type: 'colon' });
			const rest = kvMatch[2];
			if (rest.trim().length > 0) {
				tokens.push({ text: ' ', type: 'indent' });
				tokens.push(...tokenizeValue(rest.trim()));
			}
			return tokens;
		}

		// Fallback
		tokens.push(...tokenizeValue(yaml));
		return tokens;
	}

	function tokenizeValue(val: string): Token[] {
		if (val.startsWith('"') || val.startsWith("'")) {
			return [{ text: val, type: 'str' }];
		}
		if (val === 'true' || val === 'false') {
			return [{ text: val, type: 'bool' }];
		}
		if (/^-?\d+(\.\d+)?$/.test(val)) {
			return [{ text: val, type: 'num' }];
		}
		// Unquoted string
		return [{ text: val, type: 'str' }];
	}

	const cards = [
		{
			title: 'Synthesis',
			icon: 'SY',
			color: '#dc2626',
			lines: [
				{ tokens: tokenize('synthesis_config:'), annotation: '# Top-level group' },
				{ tokens: tokenize('  target_library: "tsmc16nm_ff"'), annotation: '# Which chip factory process' },
				{ tokens: tokenize('  clock_frequency: "1.2GHz"'), annotation: '# How fast the chip runs' },
				{ tokens: tokenize('  power_optimization: true'), annotation: '# Save power? Yes!' },
				{ tokens: tokenize('  area_optimization: false'), annotation: '# Shrink chip size? No' },
			] as YamlLine[],
			description: 'Tells the synthesis tool how to compile your design into gates.'
		},
		{
			title: 'Place & Route',
			icon: 'PR',
			color: '#b45309',
			lines: [
				{ tokens: tokenize('pnr_config:'), annotation: '# Place & Route settings' },
				{ tokens: tokenize('  floorplan:'), annotation: '# Chip floor plan' },
				{ tokens: tokenize('    core_utilization: 0.75'), annotation: '# Use 75% of chip area' },
				{ tokens: tokenize('    aspect_ratio: 1.0'), annotation: '# Square chip' },
				{ tokens: tokenize('  routing:'), annotation: '# Wire routing' },
				{ tokens: tokenize('    effort: "high"'), annotation: '# Try hard to optimize' },
			] as YamlLine[],
			description: 'Controls how components are placed on the chip and how wires are routed.'
		},
		{
			title: 'Simulation',
			icon: 'SI',
			color: '#7c3aed',
			lines: [
				{ tokens: tokenize('simulation_config:'), annotation: '# Simulation setup' },
				{ tokens: tokenize('  simulator: "ModelSim"'), annotation: '# Which simulator tool' },
				{ tokens: tokenize('  time_resolution: "1ps"'), annotation: '# Picosecond accuracy' },
				{ tokens: tokenize('  simulation_time: "100us"'), annotation: '# Run for 100 microseconds' },
				{ tokens: tokenize('  wave_dump: true'), annotation: '# Save waveforms' },
			] as YamlLine[],
			description: 'Sets up how your design is tested before manufacturing.'
		},
		{
			title: 'Test Config',
			icon: 'TE',
			color: '#0969a8',
			lines: [
				{ tokens: tokenize('production_test:'), annotation: '# Manufacturing test setup' },
				{ tokens: tokenize('  temperature:'), annotation: '# Test at these temperatures' },
				{ tokens: tokenize('    - -40'), annotation: '# Cold corner (list item)' },
				{ tokens: tokenize('    - 25'), annotation: '# Room temperature' },
				{ tokens: tokenize('    - 125'), annotation: '# Hot corner' },
				{ tokens: tokenize('  coverage: 99.5'), annotation: '# Catch 99.5% of faults' },
			] as YamlLine[],
			description: 'Defines how chips are tested at the factory across temperature corners.'
		},
	];

	let current = $derived(cards[activeCard]);
</script>

<div class="not-prose cards-container">
	<div class="cards-header">
		<h3>Interactive: Real Semiconductor YAML Configs</h3>
		<p>Click a category to see real-world YAML used in chip design — toggle annotations for explanations</p>
	</div>

	<div class="cards-body">
		<!-- Card tabs -->
		<div class="cards-tabs">
			{#each cards as card, i}
				<button
					class="cards-tab"
					class:active={activeCard === i}
					style="--card-color: {card.color};"
					onclick={() => (activeCard = i)}
				>
					<span class="cards-tab-icon">{card.icon}</span>
					<span>{card.title}</span>
				</button>
			{/each}
		</div>

		<!-- Annotation toggle -->
		<label class="cards-toggle">
			<input type="checkbox" bind:checked={showAnnotations} />
			<span>Show annotations</span>
		</label>

		<!-- Code display -->
		<div class="cards-code">
			{#each current.lines as line, i}
				<div class="cards-line" style="animation-delay: {i * 0.06}s;">
					<span class="cards-yaml">{#each line.tokens as tok}<span class="tok-{tok.type}">{tok.text}</span>{/each}</span>
					{#if showAnnotations}
						<span class="cards-annotation">{line.annotation}</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Description -->
		<div class="cards-desc" style="border-color: {current.color};">
			{current.description}
		</div>
	</div>
</div>

<style>
	.cards-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2rem 0;
	}

	.cards-header {
		padding: 1.25rem 1.5rem 0.5rem;
	}

	.cards-header h3 {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.3rem;
	}

	.cards-header p {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.cards-body {
		padding: 1rem 1.5rem 1.25rem;
	}

	.cards-tabs {
		display: flex;
		gap: 0.4rem;
		margin-bottom: 0.75rem;
		flex-wrap: wrap;
	}

	.cards-tab {
		display: flex;
		align-items: center;
		gap: 0.3rem;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.4rem 0.7rem;
		font-family: var(--font-ui);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cards-tab:hover { border-color: var(--color-border-hover); color: var(--color-text-secondary); }

	.cards-tab.active {
		border-color: var(--card-color);
		color: var(--card-color);
		background: color-mix(in srgb, var(--card-color) 5%, var(--color-bg-card));
	}

	.cards-tab-icon { font-size: 0.85rem; }

	.cards-toggle {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-family: var(--font-ui);
		font-size: 0.75rem;
		color: var(--color-text-muted);
		cursor: pointer;
		margin-bottom: 0.75rem;
		user-select: none;
	}

	.cards-toggle input {
		accent-color: var(--color-accent);
	}

	.cards-code {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		line-height: 1.9;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 14px 18px;
		margin-bottom: 10px;
		overflow-x: auto;
		height: 240px;
		overflow-y: hidden;
	}

	.cards-line {
		display: flex;
		gap: 1.5rem;
		animation: slideIn 0.3s ease forwards;
		opacity: 0;
		white-space: pre;
	}

	.cards-yaml {
		white-space: pre;
	}

	/* Syntax highlight tokens — matches theme CSS vars */
	:global(.tok-key) { color: #0969a8; font-weight: 600; }
	:global(.tok-colon) { color: var(--color-text-muted); }
	:global(.tok-str) { color: #1a7f37; }
	:global(.tok-num) { color: #7c3aed; }
	:global(.tok-bool) { color: #c45d2c; }
	:global(.tok-dash) { color: #c45d2c; font-weight: 600; }
	:global(.tok-indent) { /* invisible */ }
	:global(.tok-comment) { color: #999; font-style: italic; }

	.cards-annotation {
		font-size: 0.75rem;
		opacity: 0.6;
		white-space: nowrap;
		color: #999;
		font-style: italic;
	}

	.cards-desc {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-secondary);
		border-left: 3px solid;
		padding: 0.5rem 0.75rem;
		background: var(--color-bg-primary);
		border-radius: 0 6px 6px 0;
		line-height: 1.6;
	}

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(-8px); }
		to { opacity: 1; transform: translateX(0); }
	}
</style>
