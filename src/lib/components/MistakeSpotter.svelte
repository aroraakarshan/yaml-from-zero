<script lang="ts">
	let step = $state(0);

	interface Mistake {
		title: string;
		wrongLines: { text: string; isError: boolean }[];
		rightLines: string[];
		errorLabel: string;
		fixLabel: string;
		explain: string;
	}

	const mistakes: Mistake[] = [
		{
			title: 'Mistake 1: Forgetting Spaces',
			wrongLines: [
				{ text: '# WRONG - No space after colon', isError: false },
				{ text: 'name:"My Processor"', isError: true },
			],
			rightLines: [
				'# RIGHT - Space after colon',
				'name: "My Processor"',
			],
			errorLabel: 'no space!',
			fixLabel: 'space added ✓',
			explain: 'YAML requires a space after every colon. Without it, YAML cannot tell where the key ends and the value begins. This is the #1 most common mistake.',
		},
		{
			title: 'Mistake 2: Using Tabs Instead of Spaces',
			wrongLines: [
				{ text: '# WRONG - Using tab key', isError: false },
				{ text: 'design:', isError: false },
				{ text: '→ name: "processor"', isError: true },
			],
			rightLines: [
				'# RIGHT - Using space bar',
				'design:',
				'  name: "processor"',
			],
			errorLabel: 'tab character!',
			fixLabel: '2 spaces ✓',
			explain: 'YAML only allows spaces for indentation — never tabs. They look the same on screen, but YAML will throw an error. Configure your editor to insert spaces when you press Tab.',
		},
		{
			title: 'Mistake 3: Inconsistent Indentation',
			wrongLines: [
				{ text: '# WRONG - Different amounts', isError: false },
				{ text: 'design:', isError: false },
				{ text: '  name: "processor"', isError: false },
				{ text: '   frequency: 100', isError: true },
			],
			rightLines: [
				'# RIGHT - Same amount',
				'design:',
				'  name: "processor"',
				'  frequency: 100',
			],
			errorLabel: '3 spaces!',
			fixLabel: '2 spaces ✓',
			explain: 'All items at the same level must use the exact same number of spaces. "name" has 2 spaces but "frequency" has 3 — YAML sees them as different levels and gets confused.',
		},
	];

	let showFix = $state(false);
	let current = $derived(mistakes[step]);

	function nextMistake() {
		showFix = false;
		step = (step + 1) % mistakes.length;
	}

	function toggleFix() {
		showFix = !showFix;
	}
</script>

<div class="ms-container">
	<div class="ms-header">
		<h3>Interactive: Common Beginner Mistakes</h3>
		<p>See each mistake, spot the error, then click "Show Fix" to see the correction</p>
	</div>

	<div class="ms-body">
		<!-- Mistake title -->
		<div class="ms-title-bar">
			<span class="ms-num">{step + 1} / {mistakes.length}</span>
			<span class="ms-title">{current.title}</span>
		</div>

		<div class="ms-split">
			<!-- Left: WRONG -->
			<div class="ms-pane wrong">
				<div class="ms-pane-label wrong-label">✗ WRONG</div>
				{#each current.wrongLines as line}
					<div class="ms-line" class:error-line={line.isError}>
						{#if line.text.startsWith('#')}
							<span class="ms-comment">{line.text}</span>
						{:else}
							<span>{line.text}</span>
						{/if}
						{#if line.isError}
							<span class="ms-error-badge">{current.errorLabel}</span>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Right: RIGHT (revealed on click) -->
			<div class="ms-pane right" class:revealed={showFix}>
				<div class="ms-pane-label right-label">✓ RIGHT</div>
				{#if showFix}
					{#each current.rightLines as line, i}
						<div class="ms-line fix-line" style="animation-delay: {i * 0.08}s;">
							{#if line.startsWith('#')}
								<span class="ms-comment">{line}</span>
							{:else}
								<span>{line}</span>
							{/if}
							{#if i === current.rightLines.length - 1}
								<span class="ms-fix-badge">{current.fixLabel}</span>
							{/if}
						</div>
					{/each}
				{:else}
					<div class="ms-hidden-text">Click "Show Fix" to reveal →</div>
				{/if}
			</div>
		</div>

		<!-- Explain -->
		<div class="ms-explain">
			{current.explain}
		</div>

		<!-- Controls -->
		<div class="ms-controls">
			<button class="dbtn dbtn-primary" onclick={toggleFix}>
				{showFix ? 'Hide Fix' : 'Show Fix'}
			</button>
			<button class="dbtn" onclick={nextMistake}>
				Next Mistake →
			</button>
		</div>
	</div>
</div>

<style>
	.ms-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.ms-header { padding: 1.25rem 1.5rem 0.75rem; }
	.ms-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.ms-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.ms-body { padding: 0 1.5rem 1.25rem; }

	.ms-title-bar {
		display: flex; align-items: center; gap: 10px; margin-bottom: 12px;
	}
	.ms-num {
		font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600;
		color: var(--color-accent); background: var(--color-accent-bg);
		padding: 2px 8px; border-radius: 4px;
	}
	.ms-title {
		font-family: var(--font-ui); font-size: 0.88rem; font-weight: 600;
		color: var(--color-text-primary);
	}

	.ms-split {
		display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
		background: var(--color-border); border-radius: 8px; overflow: hidden;
		height: 180px;
	}

	.ms-pane {
		padding: 14px 18px; overflow: hidden;
		font-family: var(--font-mono); font-size: 0.82rem; line-height: 2;
	}
	.ms-pane.wrong { background: #fef2f2; }
	.ms-pane.right { background: var(--color-bg-card); }
	.ms-pane.right.revealed { background: #f0fdf4; }

	.ms-pane-label {
		font-family: var(--font-ui); font-size: 0.68rem; font-weight: 700;
		text-transform: uppercase; letter-spacing: 0.06em;
		margin-bottom: 8px;
	}
	.wrong-label { color: #dc2626; }
	.right-label { color: #15803d; }

	.ms-line {
		white-space: pre; display: flex; align-items: center; gap: 10px;
	}

	.error-line {
		background: rgba(220, 38, 38, 0.08);
		border-radius: 4px; padding: 2px 6px; margin: 0 -6px;
	}

	.ms-error-badge {
		font-family: var(--font-ui); font-size: 0.6rem; font-weight: 700;
		color: #dc2626; background: rgba(220, 38, 38, 0.1);
		padding: 2px 8px; border-radius: 3px; white-space: nowrap;
		animation: pulse 1.5s ease infinite;
	}

	.ms-fix-badge {
		font-family: var(--font-ui); font-size: 0.6rem; font-weight: 700;
		color: #15803d; background: rgba(21, 128, 61, 0.1);
		padding: 2px 8px; border-radius: 3px; white-space: nowrap;
	}

	.fix-line {
		animation: slideIn 0.3s ease forwards; opacity: 0;
	}

	.ms-comment { color: #999; font-style: italic; }

	.ms-hidden-text {
		font-family: var(--font-ui); font-size: 0.82rem;
		color: var(--color-text-muted); padding-top: 20px;
	}

	.ms-explain {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary); border: 1px solid var(--color-border);
		border-radius: 8px; padding: 14px 18px;
		margin: 12px 0; height: 70px; overflow-y: auto;
	}

	.ms-controls { display: flex; gap: 8px; }

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(-6px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@media (max-width: 600px) {
		.ms-split { grid-template-columns: 1fr; height: 320px; }
	}
</style>
