<script lang="ts">
	let expanded = $state<Record<string, boolean>>({
		chip_info: false,
		capabilities: false,
		specifications: false,
	});

	interface Group {
		key: string;
		icon: string;
		label: string;
		color: string;
		items: { key: string; value: string; type: 'str' | 'num' | 'bool' }[];
	}

	const groups: Group[] = [
		{
			key: 'chip_info', icon: 'ℹ️', label: 'Chip Info', color: '#0969a8',
			items: [
				{ key: 'name', value: '"Simple USB Controller"', type: 'str' },
				{ key: 'version', value: '"1.0"', type: 'str' },
				{ key: 'designer', value: '"Student Engineer"', type: 'str' },
			]
		},
		{
			key: 'capabilities', icon: '⚡', label: 'Capabilities', color: '#7c3aed',
			items: [
				{ key: 'usb_version', value: '"2.0"', type: 'str' },
				{ key: 'max_speed', value: '480', type: 'num' },
				{ key: 'number_of_ports', value: '4', type: 'num' },
				{ key: 'power_saving', value: 'true', type: 'bool' },
			]
		},
		{
			key: 'specifications', icon: '📐', label: 'Specifications', color: '#b45309',
			items: [
				{ key: 'voltage', value: '3.3', type: 'num' },
				{ key: 'frequency', value: '48', type: 'num' },
				{ key: 'package_type', value: '"BGA"', type: 'str' },
				{ key: 'pin_count', value: '64', type: 'num' },
			]
		},
	];

	function toggle(key: string) {
		expanded[key] = !expanded[key];
	}

	const typeColor: Record<string, string> = {
		str: '#1a7f37', num: '#7c3aed', bool: '#c45d2c'
	};
</script>

<div class="ne-container">
	<div class="ne-header">
		<h3>Interactive: The Backpack Analogy</h3>
		<p>Click each pocket to open it — see the YAML that lives inside</p>
	</div>

	<div class="ne-split">
		<!-- Left: Visual pockets -->
		<div class="ne-visual">
			<div class="ne-backpack-label">
				<span class="ne-bp-icon">🎒</span>
				<span><strong>usb_controller</strong> (the backpack)</span>
			</div>
			{#each groups as group}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="ne-pocket" class:open={expanded[group.key]} onclick={() => toggle(group.key)} style="--pocket-color: {group.color};">
					<div class="ne-pocket-header">
						<span class="ne-pocket-icon">{group.icon}</span>
						<span class="ne-pocket-name">{group.label}</span>
						<span class="ne-pocket-arrow">{expanded[group.key] ? '▾' : '▸'}</span>
					</div>
					{#if expanded[group.key]}
						<div class="ne-pocket-items">
							{#each group.items as item, i}
								<div class="ne-pocket-item" style="animation-delay: {i * 0.05}s;">
									{#if item.key === '-'}
										<span class="ne-item-dash">-</span>
									{:else}
										<span class="ne-item-key">{item.key}:</span>
									{/if}
									<span class="ne-item-val" style="color: {typeColor[item.type]};">{item.value}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			{/each}
		</div>

		<!-- Right: Full YAML with highlights -->
		<div class="ne-yaml">
			<div class="ne-yaml-line"><span class="ne-y-key">usb_controller</span><span class="ne-y-colon">:</span></div>
			{#each groups as group}
				<div class="ne-yaml-line" class:highlight={expanded[group.key]}>&nbsp;&nbsp;<span class="ne-y-key">{group.key}</span><span class="ne-y-colon">:</span></div>
				{#each group.items as item}
					<div class="ne-yaml-line ne-yaml-child" class:highlight={expanded[group.key]}>
						{#if item.key === '-'}
							&nbsp;&nbsp;&nbsp;&nbsp;<span class="ne-y-dash">-</span> <span class="ne-y-val" style="color: {typeColor[item.type]};">{item.value}</span>
						{:else}
							&nbsp;&nbsp;&nbsp;&nbsp;<span class="ne-y-key">{item.key}</span><span class="ne-y-colon">: </span><span class="ne-y-val" style="color: {typeColor[item.type]};">{item.value}</span>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>
</div>

<style>
	.ne-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.ne-header { padding: 1.25rem 1.5rem 0.5rem; }
	.ne-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.ne-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.ne-split {
		display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
		margin: 0.75rem 1.5rem 1.25rem;
		background: var(--color-border); border-radius: 8px; overflow: hidden;
	}

	.ne-visual {
		background: var(--color-bg-card); padding: 20px 24px; overflow: hidden;
	}
	.ne-backpack-label {
		display: flex; align-items: center; gap: 6px;
		font-family: var(--font-ui); font-size: 0.82rem; color: var(--color-text-secondary);
		margin-bottom: 12px;
	}
	.ne-bp-icon { font-size: 1.1rem; }

	.ne-pocket {
		border: 1px solid var(--color-border); border-radius: 8px;
		margin-bottom: 8px; overflow: hidden; cursor: pointer;
		transition: border-color 0.2s;
	}
	.ne-pocket:hover { border-color: var(--pocket-color); }
	.ne-pocket.open { border-color: var(--pocket-color); }

	.ne-pocket-header {
		display: flex; align-items: center; gap: 8px;
		padding: 10px 14px; background: var(--color-bg-primary);
		font-family: var(--font-ui); font-size: 0.82rem; font-weight: 600;
		color: var(--color-text-primary);
	}
	.ne-pocket.open .ne-pocket-header { color: var(--pocket-color); }
	.ne-pocket-icon { font-size: 0.9rem; }
	.ne-pocket-arrow { margin-left: auto; font-size: 0.75rem; color: var(--color-text-muted); }
	.ne-pocket-name { flex: 1; }

	.ne-pocket-items { padding: 8px 14px 12px; }
	.ne-pocket-item {
		font-family: var(--font-mono); font-size: 0.78rem;
		padding: 3px 0; display: flex; gap: 8px;
		animation: slideIn 0.2s ease forwards; opacity: 0;
	}
	.ne-item-key { color: #0969a8; font-weight: 600; }
	.ne-item-dash { color: #c45d2c; font-weight: 700; }

	.ne-yaml {
		background: var(--color-bg-primary); padding: 20px 24px;
		font-family: var(--font-mono); font-size: 0.82rem; line-height: 2;
		overflow: hidden;
	}
	.ne-yaml-line {
		white-space: pre; padding: 2px 6px; border-radius: 3px;
		transition: background 0.2s;
	}
	.ne-yaml-line.highlight { background: var(--color-accent-bg); }
	.ne-y-key { color: #0969a8; font-weight: 600; }
	.ne-y-colon { color: var(--color-text-muted); }
	.ne-y-dash { color: #c45d2c; font-weight: 700; }
	.ne-y-indent { }

	@keyframes slideIn {
		from { opacity: 0; transform: translateX(-6px); }
		to { opacity: 1; transform: translateX(0); }
	}

	@media (max-width: 600px) {
		.ne-split { grid-template-columns: 1fr; }
	}
</style>
