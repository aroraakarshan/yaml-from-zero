<script lang="ts">
	let activeType = $state<'string' | 'number' | 'boolean'>('string');

	const types = {
		string: {
			color: '#1a7f37',
			label: 'Strings (Text)',
			examples: [
				{ key: 'chip_name', value: '"My Awesome Processor"' },
				{ key: 'designer_name', value: '"Alice Johnson"' },
				{ key: 'family', value: '"Cyclone V"' }
			],
			note: 'Use quotes for text, especially with spaces or special characters'
		},
		number: {
			color: '#7c3aed',
			label: 'Numbers',
			examples: [
				{ key: 'frequency', value: '100' },
				{ key: 'voltage', value: '1.2' },
				{ key: 'temperature', value: '-25' }
			],
			note: 'Whole numbers, decimals, and negatives — no quotes needed'
		},
		boolean: {
			color: '#c45d2c',
			label: 'Booleans (Yes/No)',
			examples: [
				{ key: 'debug_mode', value: 'true' },
				{ key: 'testing_done', value: 'false' },
				{ key: 'power_saving', value: 'true' }
			],
			note: 'Use true or false (lowercase) — avoid yes/no/on/off'
		}
	};

	let current = $derived(types[activeType]);
</script>

<div class="not-prose demo">
	<div class="demo-label">Interactive — YAML data types</div>
	<div class="demo-body">
		<div class="dt-tabs">
			{#each Object.entries(types) as [key, t]}
				<button
					class="dt-tab"
					class:active={activeType === key}
					style="--tab-color: {t.color};"
					onclick={() => (activeType = key as 'string' | 'number' | 'boolean')}
				>
					{t.label}
				</button>
			{/each}
		</div>

		<div class="dt-code">
			{#each current.examples as ex, i}
				<div class="dt-line" style="animation-delay: {i * 0.1}s;">
					<span class="dt-key">{ex.key}</span><span class="dt-colon">: </span><span class="dt-value" style="color: {current.color};">{ex.value}</span>
				</div>
			{/each}
		</div>
		<div class="dt-note" style="border-color: {current.color};">
			💡 {current.note}
		</div>
	</div>
</div>

<style>
	.dt-tabs {
		display: flex;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		overflow: hidden;
		margin-bottom: 16px;
	}

	.dt-tab {
		flex: 1;
		padding: 0.6rem;
		background: var(--color-bg-primary);
		border: none;
		color: var(--color-text-muted);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border-bottom: 2px solid transparent;
	}

	.dt-tab + .dt-tab {
		border-left: 1px solid var(--color-border);
	}

	.dt-tab:hover {
		color: var(--color-text-secondary);
		background: var(--color-bg-secondary);
	}

	.dt-tab.active {
		color: var(--tab-color);
		border-bottom-color: var(--tab-color);
		background: var(--color-bg-card);
	}

	.dt-code {
		font-family: var(--font-mono);
		font-size: 0.85rem;
		line-height: 1.8;
	}

	.dt-line {
		animation: slideIn 0.3s ease forwards;
		opacity: 0;
	}

	.dt-key {
		color: #0969a8;
		font-weight: 600;
	}

	.dt-colon {
		color: var(--color-text-muted);
	}

	.dt-note {
		margin-top: 0.75rem;
		padding: 0.5rem 0.75rem;
		border-left: 3px solid;
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary);
		border-radius: 0 6px 6px 0;
	}

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(-8px); }
		to { opacity: 1; transform: translateX(0); }
	}
</style>
