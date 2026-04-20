<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { CodeJar } from 'codejar';
	import { getShikiHighlighter } from './highlight.js';
	import { validateYaml, getLineErrors, type ValidationResult, type ValidationError } from './validate.js';
	import {
		evaluateExercise,
		allChecksPassed,
		type PracticeExercise,
		type CheckResult
	} from './exercise-checker.js';
	import type { Highlighter } from 'shiki';

	let { exercise }: { exercise: PracticeExercise } = $props();

	const initialCode = exercise.starterCode ?? '';

	// State for validation display (updated on debounce, never blocks typing)
	let code = $state(initialCode);
	let validation = $state<ValidationResult>({ valid: true, errors: [], parsed: null, document: null });
	let checkResults = $state<CheckResult[]>([]);
	let completed = $state(false);
	let showHints = $state(false);
	let currentHint = $state(0);
	let celebrating = $state(false);

	let displayLineCount = $state(1);
	let lineValidity = $state<('valid' | 'error' | 'empty')[]>([]);
	let prevLineValidity = $state<('valid' | 'error' | 'empty')[]>([]);
	let lineErrors = $state<(ValidationError | null)[]>([]);

	// CodeJar instance + highlighter
	let jar: ReturnType<typeof CodeJar> | null = null;
	let highlighter: Highlighter | null = null;
	let editorEl: HTMLDivElement;

	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Shiki highlight function for CodeJar — mutates el.innerHTML directly
	function highlight(el: HTMLElement) {
		if (!highlighter) return;
		const text = el.textContent ?? '';
		try {
			const tokens = highlighter.codeToTokensBase(text || ' ', { lang: 'yaml', theme: 'github-light' });
			// Build flat HTML: each token as a styled span, lines joined by \n
			let html = '';
			for (let i = 0; i < tokens.length; i++) {
				if (i > 0) html += '\n';
				for (const token of tokens[i]) {
					const escaped = token.content
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;');
					if (token.color) {
						html += `<span style="color:${token.color}">${escaped}</span>`;
					} else {
						html += escaped;
					}
				}
			}
			el.innerHTML = html;
		} catch {
			// On error, leave text as-is
		}
	}

	function runValidation(text: string) {
		code = text;
		validation = validateYaml(text);
		checkResults = evaluateExercise(exercise, validation, text);

		const wasCompleted = completed;
		completed = allChecksPassed(checkResults);
		if (completed && !wasCompleted) {
			celebrating = true;
			setTimeout(() => (celebrating = false), 1800);
		}

		const lines = text.split('\n');
		displayLineCount = lines.length;
		const errors = getLineErrors(validation, displayLineCount);
		lineErrors = errors;

		prevLineValidity = [...lineValidity];
		lineValidity = lines.map((line, i) => {
			if (!line.trim()) return 'empty';
			return errors[i] ? 'error' : 'valid';
		});
	}

	function onUpdate(text: string) {
		if (debounceTimer) clearTimeout(debounceTimer);
		// Longer debounce to avoid flashing errors while still typing (e.g. mid-quote)
		debounceTimer = setTimeout(() => runValidation(text), 500);
	}

	function resetEditor() {
		completed = false;
		celebrating = false;
		showHints = false;
		currentHint = 0;
		jar?.updateCode(initialCode);
		runValidation(initialCode);
	}

	function nextHint() {
		if (exercise.hints && currentHint < exercise.hints.length - 1) {
			currentHint++;
		}
	}

	onMount(async () => {
		highlighter = await getShikiHighlighter();

		jar = CodeJar(editorEl, highlight, {
			tab: '  ',
			indentOn: /:\s*$/,
			moveToNewLine: /:\s*$/,
			addClosing: false
		});

		jar.updateCode(initialCode);
		jar.onUpdate(onUpdate);

		// Initial validation
		runValidation(initialCode);
	});

	onDestroy(() => {
		jar?.destroy();
		if (debounceTimer) clearTimeout(debounceTimer);
	});
</script>

<div class="pe-container" class:pe-celebrating={celebrating} class:pe-completed={completed}>
	<div class="pe-header">
		<div class="pe-eyebrow">Practice</div>
		<h3 class="pe-title">{exercise.title}</h3>
		<p class="pe-instructions">{exercise.instructions}</p>
	</div>

	<div class="pe-editor-wrap">
		<!-- Gutter -->
		<div class="pe-gutter" aria-hidden="true">
			{#each Array(displayLineCount) as _, i}
				<div class="pe-gutter-line">
					<span class="pe-line-num">{i + 1}</span>
					{#if lineValidity[i] === 'valid'}
						<span class="pe-mark pe-mark-valid" class:pe-mark-fresh={prevLineValidity[i] !== 'valid'} title="Valid YAML">✓</span>
					{:else if lineValidity[i] === 'error'}
						<span class="pe-mark pe-mark-error" title={lineErrors[i]?.message ?? 'Error'}>×</span>
					{:else}
						<span class="pe-mark">&nbsp;</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- CodeJar editor -->
		<div
			class="pe-editor"
			bind:this={editorEl}
			role="textbox"
			aria-multiline="true"
			aria-label="YAML practice editor for: {exercise.title}"
		></div>
	</div>

	<!-- Error list for accessibility (hide transient mid-typing errors) -->
	{#if validation.errors.filter(e => !e.transient).length > 0}
		<div class="pe-errors" role="status" aria-live="polite">
			{#each validation.errors.filter(e => !e.transient) as err}
				<div class="pe-error-item">
					<span class="pe-error-loc">Line {err.line}</span>
					<span class="pe-error-msg">{err.message}</span>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Exercise checklist -->
	<div class="pe-checks">
		<div class="pe-checks-label">Requirements</div>
		{#each checkResults as check}
			<div class="pe-check" class:pe-check-pass={check.passed}>
				<span class="pe-check-icon">{check.passed ? '✓' : '○'}</span>
				<span class="pe-check-text">{check.description}</span>
			</div>
		{/each}
	</div>

	<!-- Controls -->
	<div class="pe-controls">
		{#if exercise.hints && exercise.hints.length > 0 && !completed}
			<button class="dbtn" onclick={() => (showHints = true)}>
				{showHints ? 'Hint' : 'Need a hint?'}
			</button>
		{/if}
		<button class="dbtn" onclick={resetEditor}>↻ Reset</button>
	</div>

	<!-- Hints -->
	{#if showHints && exercise.hints}
		<div class="pe-hints">
			<div class="pe-hint">
				<span class="pe-hint-label">Hint {currentHint + 1}/{exercise.hints.length}</span>
				{exercise.hints[currentHint]}
			</div>
			{#if currentHint < exercise.hints.length - 1}
				<button class="dbtn" onclick={nextHint}>Next hint</button>
			{/if}
		</div>
	{/if}

	<!-- Completion banner -->
	{#if completed}
		<div class="pe-complete-banner" class:pe-banner-enter={celebrating}>
			<span class="pe-complete-icon">✦</span>
			<span class="pe-complete-text">Well done — all requirements met!</span>
		</div>
	{/if}
</div>

<style>
	/* ─── Container ─── */
	.pe-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2.5rem 0;
		transition: border-color 0.4s ease;
	}
	.pe-completed {
		border-color: rgba(26, 127, 55, 0.3);
	}
	.pe-celebrating {
		animation: celebratePulse 1.8s ease;
	}

	/* ─── Header ─── */
	.pe-header {
		padding: 1.25rem 1.5rem 0.75rem;
	}
	.pe-eyebrow {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--color-accent);
		margin-bottom: 0.35rem;
	}
	.pe-title {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.3rem;
	}
	.pe-instructions {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	/* ─── Editor wrapper ─── */
	.pe-editor-wrap {
		display: flex;
		margin: 0 1.5rem;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		background: var(--color-bg-card);
	}

	/* ─── Gutter ─── */
	.pe-gutter {
		display: flex;
		flex-direction: column;
		padding: 12px 0;
		background: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		overflow: hidden;
		user-select: none;
		min-width: 48px;
	}
	.pe-gutter-line {
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 0 6px 0 8px;
		height: 22.4px;
		font-family: var(--font-mono);
		font-size: 0.72rem;
	}
	.pe-line-num {
		color: var(--color-text-muted);
		min-width: 16px;
		text-align: right;
	}
	.pe-mark {
		font-size: 0.65rem;
		width: 14px;
		text-align: center;
	}
	.pe-mark-valid {
		color: #1a7f37;
	}
	.pe-mark-fresh {
		animation: markFadeIn 0.3s ease forwards;
	}
	.pe-mark-error {
		color: #dc2626;
		font-weight: 700;
	}

	/* ─── CodeJar Editor ─── */
	.pe-editor {
		flex: 1;
		min-height: 160px;
		padding: 12px 16px;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		line-height: 22.4px;
		tab-size: 2;
		white-space: pre;
		overflow-x: auto;
		outline: none;
		caret-color: var(--color-accent);
		color: var(--color-text-primary);
	}
	.pe-editor :global(::selection) {
		background: rgba(196, 93, 44, 0.15);
	}

	/* ─── Errors ─── */
	.pe-errors {
		margin: 8px 1.5rem 0;
		padding: 8px 12px;
		background: rgba(220, 38, 38, 0.04);
		border: 1px solid rgba(220, 38, 38, 0.12);
		border-radius: 6px;
	}
	.pe-error-item {
		font-family: var(--font-ui);
		font-size: 0.75rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		display: flex;
		gap: 8px;
	}
	.pe-error-loc {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		font-weight: 700;
		color: #dc2626;
		white-space: nowrap;
	}
	.pe-error-msg {
		color: var(--color-text-secondary);
	}

	/* ─── Checklist ─── */
	.pe-checks {
		padding: 12px 1.5rem;
	}
	.pe-checks-label {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--color-text-muted);
		margin-bottom: 6px;
	}
	.pe-check {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-secondary);
		padding: 3px 0;
		transition: color 0.3s ease;
	}
	.pe-check-pass {
		color: #1a7f37;
	}
	.pe-check-icon {
		font-size: 0.72rem;
		width: 16px;
		text-align: center;
		transition: transform 0.3s ease;
	}
	.pe-check-pass .pe-check-icon {
		transform: scale(1.15);
	}
	.pe-check-text {
		flex: 1;
	}

	/* ─── Controls ─── */
	.pe-controls {
		display: flex;
		gap: 8px;
		padding: 0 1.5rem 12px;
	}

	/* ─── Hints ─── */
	.pe-hints {
		margin: 0 1.5rem 12px;
		padding: 10px 14px;
		background: var(--color-accent-bg);
		border: 1px solid rgba(196, 93, 44, 0.15);
		border-radius: 8px;
	}
	.pe-hint {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-secondary);
		line-height: 1.5;
	}
	.pe-hint-label {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--color-accent);
		margin-right: 8px;
	}

	/* ─── Completion banner ─── */
	.pe-complete-banner {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 0 1.5rem 1.25rem;
		padding: 12px 16px;
		background: rgba(26, 127, 55, 0.06);
		border: 1px solid rgba(26, 127, 55, 0.18);
		border-radius: 8px;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: #1a7f37;
		font-weight: 600;
	}
	.pe-banner-enter {
		animation: bannerSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.pe-complete-icon {
		font-size: 1rem;
	}

	/* ─── Animations ─── */
	@keyframes markFadeIn {
		from { opacity: 0; transform: scale(0.5); }
		to { opacity: 1; transform: scale(1); }
	}

	@keyframes bannerSlideIn {
		from { opacity: 0; transform: translateX(20px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@keyframes celebratePulse {
		0% { box-shadow: 0 0 0 0 rgba(196, 93, 44, 0.15); }
		30% { box-shadow: 0 0 0 8px rgba(196, 93, 44, 0.08); }
		100% { box-shadow: 0 0 0 0 rgba(196, 93, 44, 0); }
	}

	/* ─── Responsive ─── */
	@media (max-width: 600px) {
		.pe-header { padding: 1rem 1rem 0.5rem; }
		.pe-editor-wrap { margin: 0 1rem; }
		.pe-checks { padding: 10px 1rem; }
		.pe-controls { padding: 0 1rem 10px; }
		.pe-hints { margin: 0 1rem 10px; }
		.pe-errors { margin: 8px 1rem 0; }
		.pe-complete-banner { margin: 0 1rem 1rem; }
		.pe-gutter { min-width: 40px; }
		.pe-gutter-line { padding: 0 4px 0 4px; }
	}
</style>
