<script lang="ts">
	let step = $state(0);

	const titles = [
		'Start — three pieces, one flow',
		'Step 1: you edit the YAML',
		'Step 2: the Python script reads it',
		'Step 3: the EDA tool runs',
		'Step 4: results come back'
	];

	const explains = [
		'Three boxes. You edit the leftmost (YAML). The CAD team owns the middle one (Python script). The right one is whichever EDA tool you are running — synthesis, simulation, place-and-route, anything. Click Next to walk through one full run.',
		'You open chip_config.yaml in any text editor and change a value — say clock_period_ns: 0.8 → 0.7. Save the file. That is your entire job here.',
		'You launch the wrapper from the terminal: python run_synth.py. The script opens your YAML, calls yaml.safe_load(), and now has all your settings as variables it can pass on.',
		'The script feeds those settings into the EDA tool — clock period, RTL files, libraries. The tool runs (synthesis in this example) and produces logs, reports, and gate-level netlists.',
		'Reports flow back: timing, area, power. If something failed, the error usually traces back to a value in your YAML — wrong path, wrong number, wrong type. You fix the YAML and re-run.'
	];

	const next = () => {
		if (step < 4) step += 1;
	};
	const reset = () => (step = 0);

	const yamlActive = $derived(step >= 1);
	const scriptActive = $derived(step >= 2);
	const toolActive = $derived(step >= 3);
	const resultsActive = $derived(step >= 4);

	const arrow1 = $derived(step >= 2);
	const arrow2 = $derived(step >= 3);
	const arrow3 = $derived(step >= 4);
</script>

<div class="wrap not-prose">
	<div class="title">{titles[step]}</div>

	<div class="stage">
		<svg viewBox="0 0 720 240" preserveAspectRatio="xMidYMid meet" class="diagram">
			<!-- YAML box -->
			<g class="box" class:on={yamlActive}>
				<rect x="20" y="30" width="170" height="140" rx="10" />
				<text x="105" y="62" class="box-glyph">&#123; &#125;</text>
				<text x="105" y="92" class="box-label">YAML config</text>
				<text x="105" y="114" class="box-file">chip_config.yaml</text>
				<text x="105" y="148" class="box-who">you edit this</text>
			</g>

			<!-- arrow 1 -->
			<g class="arrow" class:on={arrow1}>
				<line x1="195" y1="100" x2="270" y2="100" />
				<polygon points="270,100 260,95 260,105" />
				<text x="232" y="88" class="arrow-label">read</text>
			</g>

			<!-- Python script box -->
			<g class="box" class:on={scriptActive}>
				<rect x="275" y="30" width="170" height="140" rx="10" />
				<text x="360" y="62" class="box-glyph">&gt;_</text>
				<text x="360" y="92" class="box-label">Python script</text>
				<text x="360" y="114" class="box-file">run_synth.py</text>
				<text x="360" y="148" class="box-who">CAD team owns</text>
			</g>

			<!-- arrow 2 -->
			<g class="arrow" class:on={arrow2}>
				<line x1="450" y1="100" x2="525" y2="100" />
				<polygon points="525,100 515,95 515,105" />
				<text x="487" y="88" class="arrow-label">drive</text>
			</g>

			<!-- EDA tool box -->
			<g class="box" class:on={toolActive}>
				<rect x="530" y="30" width="170" height="140" rx="10" />
				<text x="615" y="62" class="box-glyph">&#x2699;</text>
				<text x="615" y="92" class="box-label">EDA tool</text>
				<text x="615" y="114" class="box-file">synth / sim / PnR</text>
				<text x="615" y="148" class="box-who">does the work</text>
			</g>

			<!-- arrow 3 — results loop back; arrowhead sits near the label -->
			<g class="arrow back" class:on={arrow3}>
				<path d="M 615 175 Q 615 205 360 205 Q 105 205 105 175" fill="none" />
				<polygon points="350,205 362,200 362,210" />
				<text x="356" y="222" class="arrow-label">reports / errors</text>
			</g>
		</svg>
	</div>

	<div class="explain">{explains[step]}</div>

	<div class="controls">
		<button class="btn ghost" onclick={reset} disabled={step === 0}>Reset</button>
		<div class="dots">
			{#each [0, 1, 2, 3, 4] as i}
				<span class="dot" class:on={step >= i}></span>
			{/each}
		</div>
		<button class="btn primary" onclick={next} disabled={step === 4}>
			{step === 0 ? 'Start' : step === 4 ? 'Done ✓' : 'Next'}
		</button>
	</div>
</div>

<style>
	.wrap {
		background: #ffffff;
		border: 1px solid var(--color-border, #e5d9c8);
		border-radius: 12px;
		padding: 1.25rem 1.25rem 1rem;
		margin: 1.75rem 0;
		font-family: var(--font-ui, 'JetBrains Mono', monospace);
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
	}

	.title {
		font-size: 0.78rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--color-accent, #c45d2c);
		margin-bottom: 0.85rem;
		min-height: 1.2em;
	}

	.stage {
		background: #faf9f6;
		border: 1px solid #ede2d0;
		border-radius: 10px;
		padding: 0.5rem;
		overflow: hidden;
	}

	.diagram {
		width: 100%;
		height: 240px;
		display: block;
	}

	.box rect {
		fill: #ffffff;
		stroke: #d6c7ad;
		stroke-width: 1.5;
		transition: all 0.45s ease;
	}
	.box text {
		fill: #8a7a5e;
		text-anchor: middle;
		font-family: var(--font-ui, 'JetBrains Mono', monospace);
		transition: fill 0.45s ease;
	}
	.box .box-glyph {
		font-size: 22px;
		font-weight: 600;
		letter-spacing: 0.04em;
	}
	.box .box-label {
		font-size: 13px;
		font-weight: 600;
	}
	.box .box-file {
		font-size: 11px;
		fill: #b09c7a;
	}
	.box .box-who {
		font-size: 10px;
		font-style: italic;
	}

	.box.on rect {
		fill: #fff5ec;
		stroke: var(--color-accent, #c45d2c);
		stroke-width: 2;
		filter: drop-shadow(0 2px 6px rgba(196, 93, 44, 0.22));
	}
	.box.on .box-glyph,
	.box.on .box-label {
		fill: var(--color-accent, #c45d2c);
	}
	.box.on .box-file {
		fill: #6b4a2b;
	}
	.box.on .box-who {
		fill: #8a5a3a;
	}

	.arrow line,
	.arrow path {
		stroke: #d6c7ad;
		stroke-width: 1.5;
		transition: all 0.4s ease;
	}
	.arrow polygon {
		fill: #d6c7ad;
		transition: fill 0.4s ease;
	}
	.arrow text {
		fill: #b09c7a;
		text-anchor: middle;
		font-size: 10px;
		font-style: italic;
		transition: fill 0.4s ease;
	}

	.arrow.on line,
	.arrow.on path {
		stroke: var(--color-accent, #c45d2c);
		stroke-width: 2;
	}
	.arrow.on polygon {
		fill: var(--color-accent, #c45d2c);
	}
	.arrow.on text {
		fill: var(--color-accent, #c45d2c);
		font-weight: 600;
	}

	.explain {
		margin-top: 0.85rem;
		padding: 0.85rem 1rem;
		background: #fbf6ee;
		border-left: 3px solid var(--color-accent, #c45d2c);
		border-radius: 4px;
		font-size: 0.86rem;
		line-height: 1.55;
		color: #4a3a26;
		min-height: 95px;
		font-family: var(--font-body, ui-sans-serif, system-ui, sans-serif);
		display: flex;
		align-items: flex-start;
	}

	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		margin-top: 0.85rem;
	}

	.dots {
		display: flex;
		gap: 6px;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #e5d9c8;
		transition: background 0.3s ease;
	}
	.dot.on {
		background: var(--color-accent, #c45d2c);
	}

	.btn {
		font-family: var(--font-ui, 'JetBrains Mono', monospace);
		font-size: 0.78rem;
		font-weight: 600;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.btn.primary {
		background: var(--color-accent, #c45d2c);
		color: white;
	}
	.btn.primary:not(:disabled):hover {
		background: #a84e22;
	}
	.btn.ghost {
		background: transparent;
		color: #8a7a5e;
		border-color: #d6c7ad;
	}
	.btn.ghost:not(:disabled):hover {
		background: #f5ebd8;
		color: #4a3a26;
	}
</style>
