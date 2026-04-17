<script lang="ts">
	interface FaqItem {
		question: string;
		answer: string;
	}

	let { items }: { items: FaqItem[] } = $props();
	let openIdx = $state(-1);

	function toggle(idx: number) {
		openIdx = openIdx === idx ? -1 : idx;
	}
</script>

<div class="faq-container">
	{#each items as item, i}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="faq-item" class:open={openIdx === i} onclick={() => toggle(i)}>
			<div class="faq-question">
				<span class="faq-q-icon">Q</span>
				<span class="faq-q-text">{item.question}</span>
				<span class="faq-arrow">{openIdx === i ? '▾' : '▸'}</span>
			</div>
			{#if openIdx === i}
				<div class="faq-answer">
					<span class="faq-a-icon">A</span>
					<span class="faq-a-text">{item.answer}</span>
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.faq-container {
		margin: 1.5rem 0;
		border: 1px solid var(--color-border);
		border-radius: 12px;
		overflow: hidden;
	}

	.faq-item {
		cursor: pointer;
		transition: background 0.15s;
	}

	.faq-item + .faq-item {
		border-top: 1px solid var(--color-border);
	}

	.faq-item:hover {
		background: var(--color-bg-secondary);
	}

	.faq-item.open {
		background: var(--color-bg-secondary);
	}

	.faq-question {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 18px;
	}

	.faq-q-icon {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--color-accent);
		background: var(--color-accent-bg);
		width: 22px;
		height: 22px;
		border-radius: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.faq-q-text {
		font-family: var(--font-ui);
		font-size: 0.88rem;
		font-weight: 600;
		color: var(--color-text-primary);
		flex: 1;
	}

	.faq-arrow {
		font-size: 0.75rem;
		color: var(--color-text-muted);
		flex-shrink: 0;
	}

	.faq-answer {
		display: flex;
		gap: 12px;
		padding: 0 18px 14px;
		animation: fadeIn 0.2s ease;
	}

	.faq-a-icon {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 700;
		color: #15803d;
		background: rgba(21, 128, 61, 0.08);
		width: 22px;
		height: 22px;
		border-radius: 5px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.faq-a-text {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
	}

	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
