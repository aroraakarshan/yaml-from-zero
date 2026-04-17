<script lang="ts">
	let step = $state(0);

	const yamlLines = [
		{ n: 1, text: 'chip_name: "TitanCore"', at: [1] },
		{ n: 2, text: 'frequency_mhz: 100', at: [2] },
		{ n: 3, text: 'debug_mode: true', at: [3] },
		{ n: 4, text: 'team:', at: [4] },
		{ n: 5, text: '  - "Alice"', at: [4] },
		{ n: 6, text: '  - "Bob"', at: [4] }
	];

	const entries = [
		{ key: "'chip_name'", value: "'TitanCore'", type: 'str', at: 1 },
		{ key: "'frequency_mhz'", value: '100', type: 'int', at: 2 },
		{ key: "'debug_mode'", value: 'True', type: 'bool', at: 3 },
		{ key: "'team'", value: "['Alice', 'Bob']", type: 'list', at: 4 }
	];

	const titles = [
		'Start — your YAML file',
		'Step 1: first entry becomes a string',
		'Step 2: numbers become integers',
		'Step 3: true / false become Python booleans',
		'Step 4: dash lists become Python lists'
	];

	const explains = [
		'Python cannot use a YAML file directly. The yaml library reads it and produces a Python dictionary — a lookup table Python can use instantly. Click Next to watch each YAML line turn into a dictionary entry.',
		'Python sees chip_name with a quoted value and stores a string entry. Keys and string values stay as text.',
		'frequency_mhz: 100 has no quotes, so Python reads 100 as an integer. Integers support arithmetic; strings do not.',
		'YAML writes "true" in lowercase. Python writes "True" with a capital T. The library converts automatically — same for false / False.',
		'The dash list in YAML becomes a Python list. Access items with config[\'team\'][0] — lists are zero-indexed.'
	];

	const colors = { str: '#1a7f37', int: '#7c3aed', bool: '#c45d2c', list: '#0969a8' };
	const labels = { str: 'str', int: 'int', bool: 'bool', list: 'list' };

	let lineState = $derived(
		yamlLines.map((line) => ({
			...line,
			on: line.at.includes(step),
			off: step !== 0 && !line.at.includes(step)
		}))
	);

	let entryState = $derived(
		entries.map((e) => ({
			...e,
			shown: step >= e.at,
			pop: step === e.at
		}))
	);

	function go(n: number) {
		step = Math.max(0, Math.min(n, 4));
	}
</script>

<div class="p2y">
	<div class="p2y-head">
		<div class="p2y-title">
			<h3>How Python Reads Your YAML File</h3>
			<span class="p2y-step">Step {step} / 4</span>
		</div>
		<p>{titles[step]}</p>
	</div>

	<!-- YAML file panel -->
	<div class="p2y-panel">
		<div class="p2y-panel-head">
			<span class="p2y-tab">chip_config.yaml</span>
		</div>
		<div class="p2y-yaml">
			{#each lineState as line}
				<div class="p2y-yline" class:on={line.on} class:off={line.off}>
					<span class="p2y-ln">{line.n}</span>
					<span class="p2y-yt">{line.text}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Pipe -->
	<div class="p2y-pipe">
		<div class="p2y-pipe-line"></div>
		<div class="p2y-pipe-call">yaml.safe_load()</div>
		<div class="p2y-pipe-line"></div>
		<svg class="p2y-pipe-arrow" viewBox="0 0 20 14" aria-hidden="true">
			<path d="M10 14 L0 4 L6 4 L6 0 L14 0 L14 4 L20 4 Z" fill="#c45d2c" />
		</svg>
	</div>

	<!-- Python dict panel -->
	<div class="p2y-panel">
		<div class="p2y-panel-head">
			<span class="p2y-tab">Python dictionary (config)</span>
		</div>
		<div class="p2y-dict">
			<div class="p2y-brace">config = {'{'}</div>
			{#each entryState as entry (entry.key)}
				<div class="p2y-row">
					<div class="p2y-ghost" class:hide={entry.shown}>
						<span class="p2y-dot"></span>
						<span class="p2y-dot"></span>
						<span class="p2y-dot"></span>
					</div>
					<div class="p2y-entry" class:show={entry.shown} class:pop={entry.pop}>
						<span class="p2y-k">{entry.key}</span>
						<span class="p2y-co">:</span>
						<span class="p2y-v" style="color:{colors[entry.type]}">{entry.value}</span>
						<span class="p2y-cm">,</span>
						<span class="p2y-badge">{labels[entry.type]}</span>
					</div>
				</div>
			{/each}
			<div class="p2y-brace">{'}'}</div>
		</div>
	</div>

	<!-- Explain -->
	<div class="p2y-explain">{explains[step]}</div>

	<!-- Controls -->
	<div class="p2y-ctrls">
		<button class="dbtn" onclick={() => go(step - 1)} disabled={step === 0}>← Back</button>
		<button class="dbtn dbtn-primary" onclick={() => go(step + 1)} disabled={step === 4}>
			{step === 4 ? 'Done ✓' : 'Next'}
		</button>
		<button class="dbtn" onclick={() => go(0)}>↻ Reset</button>
		<span class="p2y-pips">
			{#each [0, 1, 2, 3, 4] as i}
				<span class="p2y-pip" class:active={i === step}></span>
			{/each}
		</span>
	</div>
</div>

<style>
	.p2y {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		margin: 2rem 0;
		padding: 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 14px;
	}

	/* HEADER */
	.p2y-head {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.p2y-title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.p2y-title h3 {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}
	.p2y-step {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--color-accent);
		background: var(--color-accent-bg);
		padding: 3px 10px;
		border-radius: 999px;
		font-weight: 700;
	}
	.p2y-head p {
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-secondary);
		margin: 0;
	}

	/* PANELS — full width, fixed heights */
	.p2y-panel {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		overflow: hidden;
	}
	.p2y-panel-head {
		background: var(--color-bg-primary);
		border-bottom: 1px solid var(--color-border);
		padding: 8px 14px;
	}
	.p2y-tab {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.p2y-yaml {
		font-family: var(--font-mono);
		font-size: 0.84rem;
		line-height: 1.7;
		padding: 14px 16px 22px;
		height: 192px;
		box-sizing: border-box;
		overflow: hidden;
	}
	.p2y-yline {
		display: grid;
		grid-template-columns: 24px minmax(0, 1fr);
		padding: 1px 6px;
		border-left: 2px solid transparent;
		transition: all 0.25s ease;
		white-space: pre;
	}
	.p2y-yline.on {
		background: var(--color-accent-bg);
		border-left-color: var(--color-accent);
	}
	.p2y-yline.off {
		opacity: 0.3;
	}
	.p2y-ln {
		color: var(--color-text-muted);
		font-size: 0.72rem;
		user-select: none;
	}
	.p2y-yt {
		color: var(--color-text-primary);
		overflow-wrap: anywhere;
	}

	/* PIPE between panels */
	.p2y-pipe {
		display: grid;
		grid-template-columns: 1fr auto 1fr auto;
		align-items: center;
		gap: 10px;
		margin: -4px 12px;
	}
	.p2y-pipe-line {
		height: 2px;
		background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
	}
	.p2y-pipe-call {
		font-family: var(--font-mono);
		font-size: 0.78rem;
		color: var(--color-accent);
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		padding: 4px 12px;
		font-weight: 600;
	}
	.p2y-pipe-arrow {
		width: 16px;
		height: 12px;
		transform: rotate(180deg);
	}

	/* PYTHON DICT */
	.p2y-dict {
		font-family: var(--font-mono);
		font-size: 0.84rem;
		line-height: 1.7;
		padding: 12px 16px;
		height: 212px;
		box-sizing: border-box;
		overflow: hidden;
	}
	.p2y-brace {
		color: var(--color-text-primary);
	}
	.p2y-row {
		position: relative;
		height: 34px;
		padding-left: 22px;
	}
	.p2y-ghost,
	.p2y-entry {
		position: absolute;
		inset: 0 8px 0 22px;
		display: flex;
		align-items: center;
		gap: 6px;
		transition: opacity 0.3s ease, transform 0.3s ease;
		min-width: 0;
	}
	.p2y-ghost {
		opacity: 1;
	}
	.p2y-ghost.hide {
		opacity: 0;
	}
	.p2y-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-border);
	}
	.p2y-entry {
		opacity: 0;
		transform: translateY(4px);
	}
	.p2y-entry.show {
		opacity: 1;
		transform: translateY(0);
	}
	.p2y-entry.pop {
		animation: p2y-pop 0.45s ease;
	}
	@keyframes p2y-pop {
		0% {
			transform: translateY(10px);
			opacity: 0;
		}
		55% {
			transform: translateY(-2px);
			opacity: 1;
		}
		100% {
			transform: translateY(0);
		}
	}
	.p2y-k {
		color: #1a7f37;
		white-space: nowrap;
	}
	.p2y-co,
	.p2y-cm {
		color: var(--color-text-muted);
	}
	.p2y-v {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}
	.p2y-badge {
		font-family: var(--font-ui);
		font-size: 0.6rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--color-text-muted);
		background: var(--color-bg-secondary);
		padding: 2px 7px;
		border-radius: 4px;
		margin-left: auto;
		flex-shrink: 0;
	}

	/* EXPLAIN */
	.p2y-explain {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		line-height: 1.55;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 12px 16px;
		height: 80px;
		box-sizing: border-box;
		overflow: hidden;
		display: flex;
		align-items: center;
	}

	/* CONTROLS */
	.p2y-ctrls {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.p2y-pips {
		display: inline-flex;
		gap: 6px;
		margin-left: auto;
	}
	.p2y-pip {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--color-border);
		transition: background 0.2s;
	}
	.p2y-pip.active {
		background: var(--color-accent);
	}
</style>
