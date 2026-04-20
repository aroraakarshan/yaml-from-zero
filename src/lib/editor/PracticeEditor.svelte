<script lang="ts">
	import { onMount } from 'svelte';
	import { highlightYaml } from './highlight.js';
	import { validateYaml, getLineErrors, type ValidationResult } from './validate.js';
	import {
		evaluateExercise,
		allChecksPassed,
		type PracticeExercise,
		type CheckResult
	} from './exercise-checker.js';

	let { exercise }: { exercise: PracticeExercise } = $props();

	const initialCode = exercise.starterCode ?? '';

	// Editor state
	let code = $state(initialCode);
	let highlightedHtml = $state('');
	let validation = $state<ValidationResult>({ valid: true, errors: [], parsed: null, document: null });
	let checkResults = $state<CheckResult[]>([]);
	let completed = $state(false);
	let showHints = $state(false);
	let currentHint = $state(0);
	let composing = $state(false);
	let mounted = $state(false);

	// Line-level state for animations
	let lineCount = $derived(code.split('\n').length);
	let lineErrors = $derived(getLineErrors(validation, lineCount));
	let lineValidity = $state<('valid' | 'error' | 'empty')[]>([]);
	let prevLineValidity = $state<('valid' | 'error' | 'empty')[]>([]);

	// DOM refs
	let textareaEl: HTMLTextAreaElement;
	let overlayEl: HTMLDivElement;
	let gutterEl: HTMLDivElement;

	// Debounce timer
	let debounceTimer: ReturnType<typeof setTimeout> | null = null;

	function updateHighlightAndValidation() {
		if (composing) return;

		// Validate
		validation = validateYaml(code);
		checkResults = evaluateExercise(exercise, validation, code);

		const wasCompleted = completed;
		completed = allChecksPassed(checkResults);
		if (completed && !wasCompleted) {
			triggerCelebration();
		}

		// Compute per-line validity for animations
		prevLineValidity = [...lineValidity];
		const lines = code.split('\n');
		lineValidity = lines.map((line, i) => {
			if (!line.trim()) return 'empty';
			return lineErrors[i] ? 'error' : 'valid';
		});

		// Highlight
		highlightYaml(code).then((html) => {
			highlightedHtml = html;
		});
	}

	function debouncedUpdate() {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(updateHighlightAndValidation, 250);
	}

	function handleInput() {
		debouncedUpdate();
		syncScroll();
		autoResize();
	}

	function handleKeydown(e: KeyboardEvent) {
		// Tab → insert 2 spaces
		if (e.key === 'Tab') {
			e.preventDefault();
			const start = textareaEl.selectionStart;
			const end = textareaEl.selectionEnd;

			if (e.shiftKey) {
				// Shift+Tab: dedent current line
				const lines = code.split('\n');
				const beforeCursor = code.substring(0, start);
				const lineIndex = beforeCursor.split('\n').length - 1;
				const line = lines[lineIndex];
				if (line.startsWith('  ')) {
					lines[lineIndex] = line.substring(2);
					code = lines.join('\n');
					textareaEl.selectionStart = Math.max(0, start - 2);
					textareaEl.selectionEnd = Math.max(0, end - 2);
				}
			} else {
				// Tab: insert 2 spaces
				code = code.substring(0, start) + '  ' + code.substring(end);
				// Need to wait for Svelte to update the textarea value
				requestAnimationFrame(() => {
					textareaEl.selectionStart = textareaEl.selectionEnd = start + 2;
				});
			}
			debouncedUpdate();
		}
	}

	function syncScroll() {
		if (overlayEl && textareaEl) {
			overlayEl.scrollTop = textareaEl.scrollTop;
			overlayEl.scrollLeft = textareaEl.scrollLeft;
		}
		if (gutterEl && textareaEl) {
			gutterEl.scrollTop = textareaEl.scrollTop;
		}
	}

	function autoResize() {
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		const newHeight = Math.max(textareaEl.scrollHeight, 160);
		textareaEl.style.height = newHeight + 'px';
	}

	// Celebration
	let celebrating = $state(false);
	function triggerCelebration() {
		celebrating = true;
		setTimeout(() => (celebrating = false), 1800);
	}

	function resetEditor() {
		code = initialCode;
		completed = false;
		celebrating = false;
		showHints = false;
		currentHint = 0;
		requestAnimationFrame(() => {
			updateHighlightAndValidation();
			autoResize();
		});
	}

	function nextHint() {
		if (exercise.hints && currentHint < exercise.hints.length - 1) {
			currentHint++;
		}
	}

	onMount(() => {
		mounted = true;
		updateHighlightAndValidation();
		autoResize();
	});
</script>

<div class="pe-container" class:pe-celebrating={celebrating} class:pe-completed={completed}>
	<div class="pe-header">
		<div class="pe-eyebrow">Practice</div>
		<h3 class="pe-title">{exercise.title}</h3>
		<p class="pe-instructions">{exercise.instructions}</p>
	</div>

	<div class="pe-editor-wrap">
		<!-- Gutter: line numbers + validation marks -->
		<div class="pe-gutter" bind:this={gutterEl} aria-hidden="true">
			{#each Array(lineCount) as _, i}
				<div class="pe-gutter-line" class:pe-gutter-valid={lineValidity[i] === 'valid' && prevLineValidity[i] !== 'valid'} class:pe-gutter-error={lineValidity[i] === 'error'}>
					<span class="pe-line-num">{i + 1}</span>
					{#if lineValidity[i] === 'valid'}
						<span class="pe-mark pe-mark-valid" title="Valid YAML">✓</span>
					{:else if lineValidity[i] === 'error'}
						<span class="pe-mark pe-mark-error" title={lineErrors[i]?.message ?? 'Error'}>×</span>
					{:else}
						<span class="pe-mark">&nbsp;</span>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Editor area -->
		<div class="pe-editor">
			<!-- Shiki highlighted overlay -->
			<div
				class="pe-overlay"
				bind:this={overlayEl}
				aria-hidden="true"
			>
				{@html highlightedHtml}
			</div>

			<!-- Actual textarea -->
			<textarea
				bind:this={textareaEl}
				bind:value={code}
				oninput={handleInput}
				onkeydown={handleKeydown}
				onscroll={syncScroll}
				oncompositionstart={() => (composing = true)}
				oncompositionend={() => { composing = false; debouncedUpdate(); }}
				class="pe-textarea"
				spellcheck="false"
				autocapitalize="off"
				autocomplete="off"
				aria-label="YAML practice editor for: {exercise.title}"
				placeholder="Start typing YAML here..."
			></textarea>

			<!-- Ink stroke validation lines -->
			<div class="pe-ink-strokes" aria-hidden="true">
				{#each Array(lineCount) as _, i}
					<div
						class="pe-ink-line"
						class:pe-ink-valid={lineValidity[i] === 'valid'}
						class:pe-ink-error={lineValidity[i] === 'error'}
						class:pe-ink-fresh={lineValidity[i] === 'valid' && prevLineValidity[i] !== 'valid'}
					></div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Error list for accessibility -->
	{#if validation.errors.length > 0}
		<div class="pe-errors" role="status" aria-live="polite">
			{#each validation.errors as err}
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
		min-width: 52px;
	}
	.pe-gutter-line {
		display: flex;
		align-items: center;
		gap: 2px;
		padding: 0 6px 0 8px;
		height: 22.4px; /* matches textarea line-height */
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
		animation: markFadeIn 0.3s ease forwards;
	}
	.pe-mark-error {
		color: #dc2626;
		font-weight: 700;
	}
	.pe-gutter-valid .pe-mark-valid {
		animation: markFadeIn 0.3s ease forwards;
	}

	/* ─── Editor ─── */
	.pe-editor {
		position: relative;
		flex: 1;
		min-height: 160px;
	}

	.pe-textarea {
		position: relative;
		z-index: 2;
		width: 100%;
		min-height: 160px;
		padding: 12px 16px;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		line-height: 22.4px;
		tab-size: 2;
		white-space: pre;
		overflow-x: auto;
		overflow-y: hidden;
		border: none;
		outline: none;
		background: transparent;
		color: transparent;
		caret-color: var(--color-accent);
		resize: none;
	}
	.pe-textarea::selection {
		background: rgba(196, 93, 44, 0.15);
	}
	.pe-textarea::placeholder {
		color: var(--color-text-muted);
		opacity: 0.5;
	}

	.pe-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		pointer-events: none;
		overflow: hidden;
	}
	.pe-overlay :global(pre) {
		margin: 0;
		padding: 12px 16px;
		font-family: var(--font-mono);
		font-size: 0.82rem;
		line-height: 22.4px;
		tab-size: 2;
		white-space: pre;
		background: transparent !important;
		overflow: hidden;
	}
	.pe-overlay :global(code) {
		font-family: var(--font-mono);
		background: none;
		padding: 0;
	}

	/* ─── Ink stroke validation lines ─── */
	.pe-ink-strokes {
		position: absolute;
		top: 12px;
		left: 16px;
		right: 16px;
		z-index: 0;
		pointer-events: none;
	}
	.pe-ink-line {
		height: 22.4px;
		position: relative;
	}
	.pe-ink-line::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 1.5px;
		border-radius: 1px;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
					background-color 0.3s ease;
	}
	.pe-ink-valid::after {
		background-color: rgba(196, 93, 44, 0.25);
		transform: scaleX(1);
	}
	.pe-ink-fresh::after {
		animation: inkStroke 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}
	.pe-ink-error::after {
		background-color: rgba(220, 38, 38, 0.15);
		transform: scaleX(1);
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
	@keyframes inkStroke {
		from { transform: scaleX(0); }
		to { transform: scaleX(1); }
	}

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
