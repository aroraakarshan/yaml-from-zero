<script lang="ts">
	import { onMount } from 'svelte';

	let svgEl: SVGSVGElement;
	let visible = $state(false);
	let started = false;
	let step = $state(-1);
	let timer: ReturnType<typeof setInterval> | null = null;

	// The concept: flat list on the left, organized groups on the right
	// Step-by-step, items get color-coded by group and slide into place

	interface Item {
		key: string;
		value: string;
		group: 'processor' | 'memory';
	}

	const items: Item[] = [
		{ key: 'speed', value: '100', group: 'processor' },
		{ key: 'cores', value: '2', group: 'processor' },
		{ key: 'type', value: '"ARM"', group: 'processor' },
		{ key: 'mem_size', value: '512', group: 'memory' },
		{ key: 'mem_type', value: '"DDR4"', group: 'memory' },
		{ key: 'mem_speed', value: '2400', group: 'memory' },
	];

	const groupColors = { processor: '#0969a8', memory: '#7c3aed' };
	const groupBg = { processor: 'rgba(9,105,168,0.06)', memory: 'rgba(124,58,237,0.06)' };

	// Flat positions (left column, evenly spaced)
	const flatX = 24;
	const flatStartY = 60;
	const flatSpacing = 30;

	// Nested positions (right column, grouped)
	const nestedX = 310;
	const procHeaderY = 60;
	const procItemStartY = 85;
	const memHeaderY = 175;
	const memItemStartY = 200;
	const nestedSpacing = 26;

	// Steps: -1=nothing, 0-5=highlight each item, 6=all organized
	const totalSteps = 7;

	function startFlow() {
		step = 0;
		timer = setInterval(() => {
			if (step >= totalSteps - 1) {
				if (timer) clearInterval(timer);
			} else {
				step++;
			}
		}, 1200);
	}

	function replay() {
		if (timer) clearInterval(timer);
		step = -1;
		setTimeout(() => {
			startFlow();
		}, 300);
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !started) {
					visible = true;
					started = true;
					startFlow();
				}
			},
			{ root: document.getElementById('main-scroll'), threshold: 0.3 }
		);
		observer.observe(svgEl);
		return () => {
			observer.disconnect();
			if (timer) clearInterval(timer);
		};
	});

	// For each item, compute its position
	function getItemState(idx: number) {
		const item = items[idx];
		const isActive = step === idx;
		const isOrganized = step >= 6;
		const isRevealed = step >= idx;

		// Nested Y position
		let ny: number;
		if (item.group === 'processor') {
			const groupIdx = items.filter((it, i) => i <= idx && it.group === 'processor').length - 1;
			ny = procItemStartY + groupIdx * nestedSpacing;
		} else {
			const groupIdx = items.filter((it, i) => i <= idx && it.group === 'memory').length - 1;
			ny = memItemStartY + groupIdx * nestedSpacing;
		}

		return {
			flatOpacity: isOrganized ? 0.2 : 1,
			nestedOpacity: isRevealed ? 1 : 0,
			color: isRevealed ? groupColors[item.group] : '#888',
			highlight: isActive,
			ny,
		};
	}

	const captions = [
		'speed: 100 — this is a processor setting. It gets the blue color.',
		'cores: 2 — another processor setting. Same blue group.',
		'type: "ARM" — processor again. Three items in the blue group now.',
		'mem_size: 512 — this is a memory setting. It gets the purple color.',
		'mem_type: "DDR4" — another memory setting. Same purple group.',
		'mem_speed: 2400 — memory again. Three items in the purple group.',
		'All organized! Six flat items → two clean groups. That is what nesting does.',
	];
</script>

<div class="na-container">
	<div class="na-header">
		<h3>From Flat to Organized</h3>
		<p>Watch six scattered settings get sorted into two groups — processor and memory</p>
	</div>

	<svg bind:this={svgEl} viewBox="0 0 540 300" class="na-svg">
		{#if visible}
			<!-- LEFT: Flat list header -->
			<text x={flatX} y="38" fill="#888" font-size="9" font-weight="600" font-family="Inter, sans-serif" letter-spacing="0.05em">
				FLAT (UNORGANIZED)
			</text>

			<!-- LEFT: Flat items -->
			{#each items as item, i}
				{@const state = getItemState(i)}
				<text
					x={flatX} y={flatStartY + i * flatSpacing}
					fill={state.color}
					font-size="11" font-weight={state.highlight ? 700 : 500}
					font-family="JetBrains Mono, monospace"
					opacity={state.flatOpacity}
					style="transition: all 0.5s ease;"
				>{item.key}: {item.value}</text>
				{#if state.highlight}
					<rect x={flatX - 4} y={flatStartY + i * flatSpacing - 12}
						width="140" height="17" rx="3"
						fill={groupColors[item.group]} opacity="0.08" />
				{/if}
			{/each}

			<!-- MIDDLE: Arrow -->
			<g style="opacity: {step >= 0 ? 0.5 : 0.15}; transition: opacity 0.5s;">
				<line x1="190" y1="150" x2="275" y2="150" stroke="#c4bfb5" stroke-width="1.5" />
				<polygon points="275,145 290,150 275,155" fill="#c4bfb5" />
				<text x="240" y="170" text-anchor="middle" fill="#888" font-size="8.5" font-family="Inter, sans-serif">organize</text>
			</g>

			<!-- RIGHT: Nested groups header -->
			<text x={nestedX} y="38" fill="#888" font-size="9" font-weight="600" font-family="Inter, sans-serif" letter-spacing="0.05em">
				NESTED (ORGANIZED)
			</text>

			<!-- RIGHT: Processor group box -->
			<rect x={nestedX - 8} y={procHeaderY - 14} width="220" height={98}
				rx="6" fill={groupBg.processor}
				stroke="#0969a8" stroke-width="1"
				opacity={step >= 0 ? 0.8 : 0.15}
				style="transition: opacity 0.5s;" />
			<text x={nestedX} y={procHeaderY}
				fill="#0969a8" font-size="11" font-weight="700" font-family="JetBrains Mono, monospace"
				opacity={step >= 0 ? 1 : 0.2}
				style="transition: opacity 0.5s;">
				processor:
			</text>

			<!-- RIGHT: Processor items -->
			{#each items.filter(it => it.group === 'processor') as item, gi}
				{@const origIdx = items.indexOf(item)}
				{@const state = getItemState(origIdx)}
				<text
					x={nestedX + 14} y={procItemStartY + gi * nestedSpacing}
					fill="#0969a8" font-size="10" font-weight="500"
					font-family="JetBrains Mono, monospace"
					opacity={state.nestedOpacity}
					style="transition: opacity 0.4s ease {gi * 0.08}s;"
				>{item.key}: {item.value}</text>
			{/each}

			<!-- RIGHT: Memory group box -->
			<rect x={nestedX - 8} y={memHeaderY - 14} width="220" height={98}
				rx="6" fill={groupBg.memory}
				stroke="#7c3aed" stroke-width="1"
				opacity={step >= 3 ? 0.8 : 0.15}
				style="transition: opacity 0.5s;" />
			<text x={nestedX} y={memHeaderY}
				fill="#7c3aed" font-size="11" font-weight="700" font-family="JetBrains Mono, monospace"
				opacity={step >= 3 ? 1 : 0.2}
				style="transition: opacity 0.5s;">
				memory:
			</text>

			<!-- RIGHT: Memory items -->
			{#each items.filter(it => it.group === 'memory') as item, gi}
				{@const origIdx = items.indexOf(item)}
				{@const state = getItemState(origIdx)}
				<text
					x={nestedX + 14} y={memItemStartY + gi * nestedSpacing}
					fill="#7c3aed" font-size="10" font-weight="500"
					font-family="JetBrains Mono, monospace"
					opacity={state.nestedOpacity}
					style="transition: opacity 0.4s ease {gi * 0.08}s;"
				>{item.key}: {item.value}</text>
			{/each}
		{/if}
	</svg>

	<div class="na-caption">
		{#if step >= 0 && step < captions.length}
			{captions[step]}
		{:else if visible}
			Six settings about a chip. Some are about the processor, some about memory. How do we organize them?
		{:else}
			<span style="opacity: 0.5;">Scroll down to see the animation</span>
		{/if}
	</div>

	{#if step >= totalSteps - 1}
		<div class="na-footer">
			<button class="dbtn" onclick={replay}>↻ Replay</button>
		</div>
	{/if}
</div>

<style>
	.na-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.na-header { padding: 1.25rem 1.5rem 0.5rem; }
	.na-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.na-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.na-svg {
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--color-bg-primary);
		margin: 0.5rem 1rem;
		border-radius: 10px;
		border: 1px solid var(--color-border);
		max-width: calc(100% - 2rem);
		display: block;
	}

	.na-caption {
		padding: 0.75rem 1.5rem 1rem;
		font-family: var(--font-ui); font-size: 0.82rem;
		color: var(--color-text-secondary); line-height: 1.6;
		min-height: 2.5em;
	}

	.na-footer {
		padding: 0 1.5rem 1.25rem;
	}
</style>
