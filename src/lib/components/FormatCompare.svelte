<script lang="ts">
	import { onMount } from 'svelte';

	let containerEl: HTMLDivElement;
	let step = $state(-1);
	let started = false;
	let flowing = $state(false);
	let complete = $state(false);
	let timer: ReturnType<typeof setInterval> | null = null;

	const formats = [
		{
			label: 'Tcl Script',
			color: '#dc2626',
			lines: [
				{ text: 'set_global_assignment', cls: 'dim' },
				{ text: ' -name FAMILY ', cls: 'dim' },
				{ text: '"Cyclone V"', cls: 'val' },
			],
			fullLines: [
				'set_global_assignment -name FAMILY "Cyclone V"',
				'set_global_assignment -name DEVICE "5CGXFC7C7F23C8"',
				'set_global_assignment -name TOP_LEVEL_ENTITY "top_module"',
				'',
				'',
				'',
			],
			explain: 'Tcl buries data inside verbose commands. You must learn the tool\'s syntax to read configuration.'
		},
		{
			label: 'XML',
			color: '#7c3aed',
			fullLines: [
				'<configuration>',
				'  <family>Cyclone V</family>',
				'  <device>5CGXFC7C7F23C8</device>',
				'  <top_level_entity>top_module</top_level_entity>',
				'</configuration>',
				'',
			],
			explain: 'XML wraps every value in opening and closing tags. Lots of angle brackets, hard to scan quickly.'
		},
		{
			label: 'INI File',
			color: '#b45309',
			fullLines: [
				'[Global]',
				'Family=Cyclone V',
				'Device=5CGXFC7C7F23C8',
				'',
				'[TopLevel]',
				'Entity=top_module',
			],
			explain: 'INI files are flat — no nesting. Sections help, but complex configs become hard to manage.'
		},
		{
			label: 'YAML ✓',
			color: '#15803d',
			fullLines: [
				'fpga_settings:',
				'  family: "Cyclone V"',
				'  device: "5CGXFC7C7F23C8"',
				'  top_level_entity: "top_module"',
				'',
				'',
			],
			explain: 'YAML reads like an outline. No extra syntax — just keys, colons, and indentation. Humans and machines love it.'
		},
	];

	function startFlow() {
		flowing = true;
		complete = false;
		step = 0;
		timer = setInterval(() => {
			if (step >= formats.length - 1) {
				if (timer) clearInterval(timer);
				complete = true;
				flowing = false;
			} else {
				step++;
			}
		}, 2200);
	}

	function goTo(idx: number) {
		if (timer) clearInterval(timer);
		flowing = false;
		complete = idx >= formats.length - 1;
		step = idx;
	}

	function replay() {
		if (timer) clearInterval(timer);
		step = -1;
		setTimeout(startFlow, 300);
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !started) {
					started = true;
					startFlow();
				}
			},
			{ root: document.getElementById('main-scroll'), threshold: 0.3 }
		);
		observer.observe(containerEl);
		return () => {
			observer.disconnect();
			if (timer) clearInterval(timer);
		};
	});

	let activeFormat = $derived(step >= 0 && step < formats.length ? formats[step] : null);
</script>

<div class="cmp-container" bind:this={containerEl}>
	<div class="cmp-header">
		<h3>Interactive: The Same Config in Four Formats</h3>
		<p>Watch how the same FPGA settings look in Tcl, XML, INI, and YAML</p>
	</div>

	<div class="cmp-body">
		<!-- Step indicators -->
		<div class="cmp-steps">
			{#each formats as fmt, i}
				<button
					class="cmp-step"
					class:active={step === i}
					class:done={step > i}
					style="--step-color: {fmt.color}"
					onclick={() => goTo(i)}
				>
					<span class="cmp-step-dot"></span>
					<span class="cmp-step-label">{fmt.label}</span>
				</button>
			{/each}
		</div>

		<!-- Code display — always 6 lines for stable height -->
		<div class="cmp-code">
			{#key step}
				{#if activeFormat}
					{#each activeFormat.fullLines as line, i}
						<div
							class="cmp-line show"
							style="transition-delay: {i * 0.06}s; color: {step === formats.length - 1 ? '#1a1a1a' : '#555'};"
						>
							{line || '\u00A0'}
						</div>
					{/each}
				{:else}
					{#each Array(6) as _, i}
						<div class="cmp-line show" style="color: var(--color-text-muted);">
							{i === 0 ? 'Auto-playing... or click Next to step through.' : '\u00A0'}
						</div>
					{/each}
				{/if}
			{/key}
		</div>

		<!-- Syntax noise meter — always present -->
		<div class="cmp-meter">
			<span class="cmp-meter-label">Syntax noise</span>
			<div class="cmp-meter-track">
				<div
					class="cmp-meter-fill"
					style="width: {step === 0 ? '90%' : step === 1 ? '80%' : step === 2 ? '50%' : step === 3 ? '10%' : '0%'}; background: {activeFormat ? activeFormat.color : 'var(--color-border)'};"
				></div>
			</div>
			<span class="cmp-meter-value" style="color: {activeFormat ? activeFormat.color : 'var(--color-text-muted)'};">
				{step === 0 ? 'Very High' : step === 1 ? 'High' : step === 2 ? 'Medium' : step === 3 ? 'Minimal' : '—'}
			</span>
		</div>

		<!-- Explain bar -->
		<div class="cmp-explain">
			{#if activeFormat}
				{activeFormat.explain}
			{:else}
				The same three settings — family, device, and top-level entity — written four different ways.
			{/if}
		</div>

		<!-- Controls -->
		<div class="cmp-controls">
			<button class="dbtn" onclick={() => goTo(Math.max(0, step - 1))} disabled={step <= 0}>Back</button>
			<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= formats.length - 1}>
				{step >= formats.length - 1 ? 'Done ✓' : 'Next'}
			</button>
			<button class="dbtn" onclick={replay}>↻ Replay</button>
		</div>
	</div>
</div>

<style>
	.cmp-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2rem 0;
	}

	.cmp-header {
		padding: 1.25rem 1.5rem 0.5rem;
	}

	.cmp-header h3 {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.3rem;
	}

	.cmp-header p {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.cmp-body {
		padding: 1rem 1.5rem 1.25rem;
	}

	.cmp-steps {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	.cmp-step {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.35rem 0.75rem;
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--color-text-muted);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cmp-step:hover { border-color: var(--color-border-hover); }

	.cmp-step.active {
		border-color: var(--step-color);
		color: var(--step-color);
		background: color-mix(in srgb, var(--step-color) 5%, var(--color-bg-card));
	}

	.cmp-step.done { opacity: 0.5; }

	.cmp-step-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-border);
		transition: background 0.2s;
	}

	.cmp-step.active .cmp-step-dot { background: var(--step-color); }

	.cmp-code {
		font-family: var(--font-mono);
		font-size: 0.88rem;
		line-height: 2.2;
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 20px 24px;
		margin-bottom: 14px;
		height: 250px;
		overflow: hidden;
	}

	.cmp-line {
		opacity: 0;
		transform: translateY(6px);
		transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
		white-space: pre;
	}

	.cmp-line.show {
		opacity: 1;
		transform: translateY(0);
	}

	.cmp-meter {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 12px;
	}

	.cmp-meter-label {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		white-space: nowrap;
	}

	.cmp-meter-track {
		flex: 1;
		height: 6px;
		background: var(--color-bg-tertiary);
		border-radius: 3px;
		overflow: hidden;
	}

	.cmp-meter-fill {
		height: 100%;
		border-radius: 3px;
		transition: width 0.6s ease, background 0.3s ease;
	}

	.cmp-meter-value {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 600;
		white-space: nowrap;
		min-width: 5rem;
		text-align: right;
	}

	.cmp-explain {
		font-family: var(--font-ui);
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 12px 16px;
		margin-bottom: 12px;
		height: 70px;
		overflow-y: auto;
	}

	.cmp-controls {
		display: flex;
		gap: 8px;
	}
</style>
