<script lang="ts">
	let revealedErrors = $state<Set<number>>(new Set());
	let showCorrected = $state(false);

	interface Line {
		text: string;
		isError: boolean;
		errorType: string;
		explanation: string;
	}

	const brokenLines: Line[] = [
		{ text: '# Semiconductor Design Configuration', isError: false, errorType: '', explanation: 'Comment — fine.' },
		{ text: 'project_info:', isError: false, errorType: '', explanation: 'Parent key — fine.' },
		{ text: '  name: 5G Modem Design', isError: true, errorType: 'Missing quotes', explanation: '🐛 "5G Modem Design" contains spaces. Without quotes, YAML might misinterpret it. Fix: "5G Modem Design"' },
		{ text: '    team_lead:"Sarah Chen"', isError: true, errorType: 'Wrong indent + missing space', explanation: '🐛 Two errors! (1) Indented 4 spaces instead of 2 — wrong level. (2) No space after the colon. Fix: ··team_lead: "Sarah Chen"' },
		{ text: '  version: 2.0', isError: false, errorType: '', explanation: 'This line is correct by itself, but...' },
		{ text: '  version: 3.0', isError: true, errorType: 'Duplicate key', explanation: '🐛 "version" appears twice! YAML silently uses the last value and throws away the first. Fix: remove one of them.' },
		{ text: '', isError: false, errorType: '', explanation: '' },
		{ text: 'specifications:', isError: false, errorType: '', explanation: 'Parent key — fine.' },
		{ text: '- frequency_ghz: 2.4', isError: true, errorType: 'Wrong list format', explanation: '🐛 The dash is not indented under specifications. It should be at 2 spaces. Fix: ··frequency_ghz: 2.4 (or use ··- frequency_ghz: 2.4 if you want a list)' },
		{ text: '- power_consumption_mw:150', isError: true, errorType: 'Missing space after colon', explanation: '🐛 No space after the colon! And wrong indentation. Fix: ··power_consumption_mw: 150' },
		{ text: '  - voltage_v: 0.8', isError: true, errorType: 'Mixed indentation', explanation: '🐛 This has a dash at 2 spaces, but the items above have dashes at 0 spaces. Inconsistent! Fix: decide on one format and stick with it.' },
		{ text: '', isError: false, errorType: '', explanation: '' },
		{ text: 'testing:', isError: false, errorType: '', explanation: 'Parent key — fine.' },
		{ text: '  functional_test: TRUE', isError: true, errorType: 'Wrong boolean', explanation: '🐛 YAML booleans are lowercase: true, not TRUE. While YAML 1.1 accepts TRUE, it is inconsistent and confusing. Fix: true' },
		{ text: '  performance_test: yes', isError: false, errorType: '', explanation: '"yes" works as a boolean in YAML 1.1, but "true" is clearer and more consistent.' },
		{ text: '  power_test: True', isError: true, errorType: 'Inconsistent boolean', explanation: '🐛 "True" (capitalized) is inconsistent with the others. Use lowercase "true" everywhere. Fix: true' },
	];

	const correctedLines = [
		'# Semiconductor Design Configuration',
		'project_info:',
		'  name: "5G Modem Design"',
		'  team_lead: "Sarah Chen"',
		'  version: "3.0"',
		'',
		'specifications:',
		'  frequency_ghz: 2.4',
		'  power_consumption_mw: 150',
		'  voltage_v: 0.8',
		'',
		'testing:',
		'  functional_test: true',
		'  performance_test: true',
		'  power_test: true',
	];

	const errorCount = brokenLines.filter(l => l.isError).length;
	let foundCount = $derived(revealedErrors.size);

	function clickLine(idx: number) {
		if (brokenLines[idx].isError) {
			revealedErrors = new Set([...revealedErrors, idx]);
		}
	}

	function reset() {
		revealedErrors = new Set();
		showCorrected = false;
	}
</script>

<div class="ve-container">
	<div class="ve-header">
		<h3>Interactive: Find All the Errors</h3>
		<p>This semiconductor config has {errorCount} errors. Click each line to check it — can you find them all?</p>
	</div>

	<div class="ve-body">
		<div class="ve-score">
			Found <strong>{foundCount}</strong> of <strong>{errorCount}</strong> errors
			<div class="ve-score-bar">
				<div class="ve-score-fill" style="width: {(foundCount / errorCount) * 100}%;"></div>
			</div>
		</div>

		<div class="ve-split">
			<!-- Left: broken file -->
			<div class="ve-pane">
				<div class="ve-pane-label bad">Broken File — click each line</div>
				{#each brokenLines as line, i}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="ve-line"
						class:error-found={revealedErrors.has(i)}
						class:clean={!line.isError && line.text !== ''}
						onclick={() => clickLine(i)}
					>
						<span class="ve-num">{line.text ? i + 1 : ''}</span>
						<span class="ve-text">{line.text || '\u00A0'}</span>
						{#if revealedErrors.has(i)}
							<span class="ve-error-tag">{line.errorType}</span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Right: explanation or corrected -->
			<div class="ve-pane">
				{#if showCorrected}
					<div class="ve-pane-label good">Corrected File ✓</div>
					{#each correctedLines as line, i}
						<div class="ve-line corrected" style="animation-delay: {i * 0.04}s;">
							<span class="ve-num">{line ? i + 1 : ''}</span>
							<span class="ve-text">{line || '\u00A0'}</span>
						</div>
					{/each}
				{:else}
					<div class="ve-pane-label">Explanations</div>
					{#each brokenLines as line, i}
						{#if revealedErrors.has(i)}
							<div class="ve-explain-item" style="animation-delay: 0s;">
								<span class="ve-explain-line">Line {i + 1}:</span>
								{line.explanation}
							</div>
						{/if}
					{/each}
					{#if foundCount === 0}
						<div class="ve-explain-hint">Click any line on the left to check if it has an error.</div>
					{/if}
				{/if}
			</div>
		</div>

		<div class="ve-controls">
			{#if foundCount === errorCount && !showCorrected}
				<button class="dbtn dbtn-primary" onclick={() => (showCorrected = true)}>🎉 Show corrected file</button>
			{/if}
			{#if showCorrected}
				<button class="dbtn" onclick={reset}>↻ Try again</button>
			{/if}
			{#if foundCount > 0 && foundCount < errorCount && !showCorrected}
				<button class="dbtn" onclick={() => (showCorrected = true)}>Show answer</button>
			{/if}
		</div>
	</div>
</div>

<style>
	.ve-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.ve-header { padding: 1.25rem 1.5rem 0.75rem; }
	.ve-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.ve-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.ve-body { padding: 0 1.5rem 1.25rem; }

	.ve-score {
		display: flex; align-items: center; gap: 12px;
		font-family: var(--font-ui); font-size: 0.82rem; color: var(--color-text-secondary);
		margin-bottom: 12px;
	}
	.ve-score-bar { flex: 1; height: 6px; background: var(--color-bg-tertiary); border-radius: 3px; overflow: hidden; }
	.ve-score-fill { height: 100%; background: #15803d; border-radius: 3px; transition: width 0.4s ease; }

	.ve-split {
		display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
		background: var(--color-border); border-radius: 8px; overflow: hidden;
		height: 420px;
	}

	.ve-pane {
		background: var(--color-bg-card); padding: 0;
		font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.9;
		overflow-y: auto;
	}

	.ve-pane-label {
		font-family: var(--font-ui); font-size: 0.68rem; font-weight: 700;
		text-transform: uppercase; letter-spacing: 0.06em;
		padding: 10px 16px; position: sticky; top: 0; z-index: 1;
		background: var(--color-bg-primary); border-bottom: 1px solid var(--color-border);
		color: var(--color-text-muted);
	}
	.ve-pane-label.bad { color: #dc2626; }
	.ve-pane-label.good { color: #15803d; }

	.ve-line {
		display: flex; align-items: center; gap: 8px;
		padding: 1px 16px; cursor: pointer;
		transition: background 0.15s;
	}
	.ve-line:hover { background: var(--color-bg-secondary); }
	.ve-line.error-found { background: rgba(220, 38, 38, 0.06); }
	.ve-line.corrected {
		cursor: default;
		animation: slideIn 0.25s ease forwards; opacity: 0;
	}

	.ve-num {
		font-size: 0.68rem; color: var(--color-text-muted); min-width: 18px; text-align: right;
		user-select: none;
	}
	.ve-text { white-space: pre; }

	.ve-error-tag {
		font-family: var(--font-ui); font-size: 0.6rem; font-weight: 600;
		color: #dc2626; background: rgba(220, 38, 38, 0.08);
		padding: 1px 8px; border-radius: 3px; white-space: nowrap; margin-left: auto;
	}

	.ve-explain-item {
		font-family: var(--font-ui); font-size: 0.78rem; line-height: 1.6;
		color: var(--color-text-secondary); padding: 10px 16px;
		border-bottom: 1px solid var(--color-border);
		animation: slideIn 0.2s ease forwards;
	}
	.ve-explain-line { font-weight: 700; color: #dc2626; margin-right: 6px; }
	.ve-explain-hint {
		font-family: var(--font-ui); font-size: 0.82rem; color: var(--color-text-muted);
		padding: 20px 16px;
	}

	.ve-controls { display: flex; gap: 8px; margin-top: 12px; }

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(-4px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@media (max-width: 600px) {
		.ve-split { grid-template-columns: 1fr; height: 600px; }
	}
</style>
