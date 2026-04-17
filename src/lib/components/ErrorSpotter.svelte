<script lang="ts">
	let currentChallenge = $state(0);
	let selectedLine = $state(-1);
	let showAnswer = $state(false);

	interface Challenge {
		title: string;
		yaml: { text: string; isError: boolean; explanation: string }[];
		fixedYaml: string;
		hint: string;
	}

	const challenges: Challenge[] = [
		{
			title: 'Missing space after colon',
			yaml: [
				{ text: '# My chip settings', isError: false, explanation: 'This comment line is fine.' },
				{ text: 'chip_name:"My Processor"', isError: true, explanation: 'Bug found! There is no space after the colon. YAML requires "chip_name: " (colon then space). Without the space, YAML cannot tell where the key ends and the value begins.' },
				{ text: 'speed: 100', isError: false, explanation: 'This line is correct — space after the colon.' },
			],
			fixedYaml: 'chip_name: "My Processor"',
			hint: 'Look for a colon that is missing its space.'
		},
		{
			title: 'Inconsistent indentation',
			yaml: [
				{ text: 'design:', isError: false, explanation: 'The parent key — fine.' },
				{ text: '  name: "processor"', isError: false, explanation: 'Indented 2 spaces — correct.' },
				{ text: '   frequency: 100', isError: true, explanation: 'Bug found! This line has 3 spaces of indent, but the line above has 2. All children at the same level must use the same number of spaces. Change this to 2 spaces.' },
				{ text: '  voltage: 1.2', isError: false, explanation: 'Back to 2 spaces — this one is correct.' },
			],
			fixedYaml: '  frequency: 100',
			hint: 'Count the spaces at the beginning of each line. Are they all the same?'
		},
		{
			title: 'The boolean trap',
			yaml: [
				{ text: 'countries:', isError: false, explanation: 'The parent key for a list.' },
				{ text: '  - "United States"', isError: false, explanation: 'Quoted string — safe.' },
				{ text: '  - Norway', isError: false, explanation: 'This looks fine, but...' },
				{ text: '  - NO', isError: true, explanation: 'Bug found! YAML reads NO as the boolean value false — not the country code! You must write "NO" (with quotes) to keep it as text. This is called "the Norway problem."' },
				{ text: '  - "SE"', isError: false, explanation: 'Quoted — safe. Always quote short codes.' },
			],
			fixedYaml: '  - "NO"',
			hint: 'Some short words have special meaning in YAML. What does "NO" look like to a computer?'
		},
		{
			title: 'Tabs vs spaces',
			yaml: [
				{ text: 'config:', isError: false, explanation: 'The parent key.' },
				{ text: '\tname: "test"', isError: true, explanation: 'Bug found! This line uses a TAB character for indentation. YAML only allows SPACES — never tabs. They look the same but YAML will throw an error. Use your space bar, or configure your editor to convert tabs to spaces.' },
				{ text: '  value: 100', isError: false, explanation: 'This uses spaces — correct.' },
			],
			fixedYaml: '  name: "test"',
			hint: 'Not all whitespace is created equal. YAML is very picky about one type...'
		},
		{
			title: 'Duplicate keys',
			yaml: [
				{ text: 'processor:', isError: false, explanation: 'The parent key.' },
				{ text: '  name: "ARM Cortex-M4"', isError: false, explanation: 'First name — fine.' },
				{ text: '  frequency_mhz: 168', isError: false, explanation: 'Fine.' },
				{ text: '  name: "Different Name"', isError: true, explanation: 'Bug found! The key "name" appears twice in the same group. YAML silently uses the LAST value and throws away the first one. This is a sneaky bug — you think you set it to "ARM Cortex-M4" but it becomes "Different Name."' },
			],
			fixedYaml: '  model: "Different Name"',
			hint: 'Can two items in the same group have the exact same label?'
		},
		{
			title: 'Mixing list styles',
			yaml: [
				{ text: 'features:', isError: false, explanation: 'The parent key for a list.' },
				{ text: '  - "USB Controller"', isError: false, explanation: 'Dash style list item — fine.' },
				{ text: '  - "Ethernet"', isError: false, explanation: 'Same style — fine.' },
				{ text: '  - [WiFi, Bluetooth]', isError: true, explanation: 'Bug found! This uses square bracket style [WiFi, Bluetooth] while the other items use dash style. Never mix list styles in the same list. Write each item on its own line with a dash.' },
				{ text: '  - GPS', isError: false, explanation: 'Back to dash style, but GPS should be quoted since it is text.' },
			],
			fixedYaml: '  - "WiFi"\n  - "Bluetooth"',
			hint: 'Are all the list items formatted the same way?'
		},
		{
			title: 'Incorrect quoting',
			yaml: [
				{ text: 'design_info:', isError: false, explanation: 'The parent key.' },
				{ text: '  name: My Design', isError: true, explanation: 'Bug found! "My Design" contains a space. Without quotes, YAML might misinterpret it. Always quote text that contains spaces: "My Design".' },
				{ text: '  version: 1.0', isError: false, explanation: 'Numbers do not need quotes — this is fine.' },
				{ text: '  date: 2024-01-01', isError: false, explanation: 'This looks fine, but YAML will parse it as a date object, not text. If you want it as text, use quotes: "2024-01-01".' },
			],
			fixedYaml: '  name: "My Design"',
			hint: 'Does any text value contain spaces or special characters that need protection?'
		},
	];

	let challenge = $derived(challenges[currentChallenge]);

	function selectLine(idx: number) {
		selectedLine = idx;
		showAnswer = false;
	}

	function reveal() {
		showAnswer = true;
		selectedLine = challenge.yaml.findIndex(l => l.isError);
	}

	function nextChallenge() {
		currentChallenge = (currentChallenge + 1) % challenges.length;
		selectedLine = -1;
		showAnswer = false;
	}
</script>

<div class="es-container">
	<div class="es-header">
		<h3>Interactive: Find the Bug!</h3>
		<p>Click the line with the error — then read why it is wrong and how to fix it</p>
	</div>

	<div class="es-body">
		<!-- Challenge title -->
		<div class="es-challenge-bar">
			<span class="es-challenge-num">Challenge {currentChallenge + 1} of {challenges.length}</span>
			<span class="es-challenge-title">{challenge.title}</span>
		</div>

		<div class="es-split">
			<!-- Left: YAML with clickable lines -->
			<div class="es-code">
				{#each challenge.yaml as line, i}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="es-line"
						class:selected={selectedLine === i}
						class:error={showAnswer && line.isError}
						class:correct={showAnswer && !line.isError && selectedLine === i}
						onclick={() => selectLine(i)}
					>
						<span class="es-line-num">{i + 1}</span>
						<span class="es-line-text">{line.text.replace('\t', '→   ')}</span>
						{#if showAnswer && line.isError}
							<span class="es-bug-badge">✗</span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Right: Explanation -->
			<div class="es-explain">
				{#if selectedLine >= 0}
					<p class="es-explain-text">{challenge.yaml[selectedLine].explanation}</p>
					{#if showAnswer && challenge.yaml[selectedLine].isError}
						<div class="es-fix">
							<span class="es-fix-label">Fix:</span>
							<code class="es-fix-code">{challenge.fixedYaml}</code>
						</div>
					{/if}
				{:else}
					<p class="es-explain-text" style="color: var(--color-text-muted);">
						{challenge.hint}
					</p>
				{/if}
			</div>
		</div>

		<div class="es-controls">
			<button class="dbtn" onclick={reveal}>Show answer</button>
			<button class="dbtn dbtn-primary" onclick={nextChallenge}>Next challenge →</button>
		</div>
	</div>
</div>

<style>
	.es-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.es-header { padding: 1.25rem 1.5rem 0.5rem; }
	.es-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.es-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.es-body { padding: 0.75rem 1.5rem 1.25rem; }

	.es-challenge-bar {
		display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
	}
	.es-challenge-num {
		font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600;
		color: var(--color-accent); background: var(--color-accent-bg);
		padding: 2px 8px; border-radius: 4px;
	}
	.es-challenge-title {
		font-family: var(--font-ui); font-size: 0.85rem; font-weight: 600; color: var(--color-text-primary);
	}

	.es-split {
		display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
		background: var(--color-border); border-radius: 8px; overflow: hidden;
		height: 200px;
	}

	.es-code {
		background: var(--color-bg-card); padding: 12px 0;
		font-family: var(--font-mono); font-size: 0.82rem; line-height: 2;
		overflow: hidden;
	}

	.es-line {
		display: flex; align-items: center; gap: 8px;
		padding: 2px 16px; cursor: pointer;
		transition: background 0.15s;
	}
	.es-line:hover { background: var(--color-bg-secondary); }
	.es-line.selected { background: rgba(9,105,168,0.06); }
	.es-line.error { background: rgba(220,38,38,0.08); }
	.es-line.correct { background: rgba(26,127,55,0.06); }

	.es-line-num {
		font-size: 0.7rem; color: var(--color-text-muted); min-width: 16px; text-align: right;
	}
	.es-line-text { white-space: pre; }
	.es-bug-badge { font-size: 0.85rem; margin-left: auto; }

	.es-explain {
		background: var(--color-bg-primary); padding: 16px 20px;
		display: flex; flex-direction: column; justify-content: center;
		overflow-y: auto;
	}

	.es-explain-text {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary); margin: 0;
	}

	.es-fix {
		margin-top: 10px; display: flex; align-items: center; gap: 8px;
	}
	.es-fix-label {
		font-family: var(--font-ui); font-size: 0.72rem; font-weight: 700;
		color: #1a7f37; text-transform: uppercase; letter-spacing: 0.06em;
	}
	.es-fix-code {
		font-family: var(--font-mono); font-size: 0.78rem;
		background: rgba(26,127,55,0.08); color: #1a7f37;
		padding: 3px 10px; border-radius: 4px;
	}

	.es-controls {
		display: flex; gap: 8px; margin-top: 12px;
	}

	@media (max-width: 600px) {
		.es-split { grid-template-columns: 1fr; height: 350px; }
	}
</style>
