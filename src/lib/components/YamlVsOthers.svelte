<script lang="ts">
	import { onMount } from 'svelte';

	let svgEl: SVGSVGElement;
	let visible = $state(false);
	let started = false;
	let step = $state(0);

	const formats = [
		{
			label: 'Tcl',
			color: 'var(--color-accent-red)',
			lines: [
				'set_global_assignment -name FAMILY "Cyclone V"',
				'set_global_assignment -name DEVICE "5CGXFC7C7F23C8"',
				'set_global_assignment -name TOP_LEVEL_ENTITY "top_module"'
			]
		},
		{
			label: 'XML',
			color: 'var(--color-accent-purple)',
			lines: [
				'<configuration>',
				'  <family>Cyclone V</family>',
				'  <device>5CGXFC7C7F23C8</device>',
				'  <top_level_entity>top_module</top_level_entity>',
				'</configuration>'
			]
		},
		{
			label: 'YAML',
			color: 'var(--color-accent)',
			lines: [
				'fpga_settings:',
				'  family: "Cyclone V"',
				'  device: "5CGXFC7C7F23C8"',
				'  top_level_entity: "top_module"'
			]
		}
	];

	// Use raw hex for SVG attributes (CSS vars don't work in SVG fill/stroke)
	const fmtColors = ['#dc2626', '#7c3aed', '#c45d2c'];

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !started) {
					visible = true;
					started = true;
					runSequence();
				}
			},
			{ root: document.getElementById('main-scroll'), threshold: 0.3 }
		);
		observer.observe(svgEl);
		return () => observer.disconnect();
	});

	function runSequence() {
		step = 0;
		const interval = setInterval(() => {
			step++;
			if (step >= 2) clearInterval(interval);
		}, 2000);
	}

	let activeFormat = $derived(formats[Math.min(step, 2)]);
	let activeColor = $derived(fmtColors[Math.min(step, 2)]);
	let showingYaml = $derived(step >= 2);
</script>

<div class="not-prose demo">
	<div class="demo-label">Interactive — format comparison</div>
	<div class="demo-body">
		<svg bind:this={svgEl} viewBox="0 0 520 240" width="100%">
			<rect x="0" y="0" width="520" height="240" rx="8" fill="#faf9f6" stroke="#e5e2dc" stroke-width="1" />

			{#if visible}
				<!-- Format label badge -->
				<rect x="16" y="12" width="60" height="24" rx="4" fill={activeColor} opacity="0.12" />
				<text x="46" y="28" text-anchor="middle" fill={activeColor}
					font-size="12" font-weight="700" font-family="JetBrains Mono, monospace">
					{activeFormat.label}
				</text>

				<!-- Code lines -->
				{#each activeFormat.lines as line, i}
					<text x="24" y={56 + i * 22}
						fill={showingYaml ? '#1a1a1a' : '#555'}
						font-size="12.5" font-family="JetBrains Mono, monospace"
						style="transition: all 0.4s ease {i * 0.1}s;">
						{line}
					</text>
				{/each}

				<!-- YAML highlight badge -->
				{#if showingYaml}
					<rect x="310" y="180" width="190" height="44" rx="8"
						fill="#fef3ed" stroke="#c45d2c" stroke-width="1" opacity="0.9" />
					<text x="405" y="198" text-anchor="middle" fill="#c45d2c"
						font-size="11" font-weight="600" font-family="Inter, sans-serif">
						✓ Clean &amp; readable
					</text>
					<text x="405" y="214" text-anchor="middle" fill="#888"
						font-size="10" font-family="Inter, sans-serif">
						No extra syntax noise
					</text>
				{/if}
			{/if}

			<!-- Step indicators -->
			<g transform="translate(230, 230)">
				{#each [0, 1, 2] as s}
					<circle cx={s * 20} cy="0" r="4"
						fill={step >= s ? fmtColors[s] : '#e5e2dc'}
						style="transition: fill 0.3s ease;" />
				{/each}
			</g>
		</svg>

		{#if step >= 2}
			<div class="demo-controls">
				<button class="dbtn" onclick={runSequence}>↻ Replay</button>
			</div>
		{/if}
	</div>
</div>
