<script lang="ts">
	import { onMount } from 'svelte';

	let svgEl: SVGSVGElement;
	let visible = $state(false);
	let started = false;
	let time = $state(0);
	let animFrame = 0;

	onMount(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && !started) {
					visible = true;
					started = true;
				}
			},
			{ root: document.getElementById('main-scroll'), threshold: 0.3 }
		);
		observer.observe(svgEl);

		function tick() {
			if (visible) time++;
			animFrame = requestAnimationFrame(tick);
		}
		animFrame = requestAnimationFrame(tick);

		return () => {
			observer.disconnect();
			cancelAnimationFrame(animFrame);
		};
	});

	// Five "config files" flowing into a central YAML hub
	interface Particle {
		x: number;
		y: number;
		sourceIdx: number;
		opacity: number;
	}

	const sources = [
		{ label: 'Synthesis', x: 40, y: 30, color: '#dc2626' },
		{ label: 'Place & Route', x: 40, y: 75, color: '#b45309' },
		{ label: 'Simulation', x: 40, y: 120, color: '#7c3aed' },
		{ label: 'Test Config', x: 40, y: 165, color: '#0969a8' },
		{ label: 'CI/CD', x: 40, y: 210, color: '#0e7490' },
	];

	const hubX = 300;
	const hubY = 120;

	let particles = $derived.by(() => {
		if (!visible) return [];
		const result: Particle[] = [];
		const srcRight = 66; // src.x + 66 = right edge of source rect (src.x - 6 + 72)
		const hubLeft = hubX - 30;
		for (let s = 0; s < sources.length; s++) {
			for (let p = 0; p < 4; p++) {
				const seed = s * 50 + p * 137.508;
				const progress = ((time * 0.6 + seed) % 400) / 400;
				const src = sources[s];

				const startX = src.x + srcRight;
				const x = startX + progress * (hubLeft - startX);
				const y = src.y + progress * (hubY - src.y);
				const opacity = progress < 0.1 ? progress / 0.1 : progress > 0.85 ? (1 - progress) / 0.15 : 0.6;

				result.push({ x, y, sourceIdx: s, opacity: Math.max(0, opacity) });
			}
		}
		return result;
	});

	// Consumers on the right side
	const consumers = [
		{ label: 'Python', x: 430, y: 55 },
		{ label: 'C++', x: 430, y: 95 },
		{ label: 'Tcl', x: 430, y: 135 },
		{ label: 'Shell', x: 430, y: 175 },
	];

	let outParticles = $derived.by(() => {
		if (!visible) return [];
		const result: Particle[] = [];
		const hubRight = hubX + 30;
		for (let c = 0; c < consumers.length; c++) {
			for (let p = 0; p < 3; p++) {
				const seed = c * 70 + p * 97.3;
				const progress = ((time * 0.5 + seed) % 350) / 350;
				const con = consumers[c];

				const endX = con.x - 6; // left edge of consumer rect
				const x = hubRight + progress * (endX - hubRight);
				const y = hubY + progress * (con.y - hubY);
				const opacity = progress < 0.1 ? progress / 0.1 : progress > 0.85 ? (1 - progress) / 0.15 : 0.5;

				result.push({ x, y, sourceIdx: c, opacity: Math.max(0, opacity) });
			}
		}
		return result;
	});
</script>

<div class="hub-container">
	<div class="hub-header">
		<h3>Language Independence: One Format, Many Tools</h3>
		<p>Different teams write YAML configs → any programming language can read them</p>
	</div>

	<svg bind:this={svgEl} viewBox="0 0 500 240" class="hub-svg">
		<!-- Connection lines (sources → hub) — edge to edge -->
		{#each sources as src, i}
			<path
				d="M{src.x + 66},{src.y} Q{(src.x + 66 + hubX - 30) / 2},{src.y} {hubX - 30},{hubY}"
				fill="none"
				stroke={visible ? src.color : 'var(--color-border)'}
				stroke-width="1"
				opacity={visible ? 0.25 : 0.1}
				style="transition: all 0.8s ease"
			/>
		{/each}

		<!-- Connection lines (hub → consumers) — edge to edge -->
		{#each consumers as con, i}
			<path
				d="M{hubX + 30},{hubY} Q{(hubX + 30 + con.x - 6) / 2},{con.y} {con.x - 6},{con.y}"
				fill="none"
				stroke={visible ? '#15803d' : 'var(--color-border)'}
				stroke-width="1"
				opacity={visible ? 0.25 : 0.1}
				style="transition: all 0.8s ease"
			/>
		{/each}

		<!-- Source labels -->
		{#each sources as src, i}
			<rect x={src.x - 6} y={src.y - 10} width="72" height="20" rx="4"
				fill={visible ? src.color : 'var(--color-border)'}
				opacity={visible ? 0.08 : 0.05}
				style="transition: all 0.6s ease {i * 0.1}s"
			/>
			<text x={src.x + 30} y={src.y + 4}
				text-anchor="middle"
				fill={visible ? src.color : 'var(--color-text-muted)'}
				font-size="8" font-weight="600" font-family="Inter, sans-serif"
				opacity={visible ? 1 : 0.3}
				style="transition: all 0.6s ease {i * 0.1}s"
			>{src.label}</text>
		{/each}

		<!-- Central YAML hub -->
		<rect x={hubX - 30} y={hubY - 24} width="60" height="48" rx="10"
			fill={visible ? '#15803d' : 'var(--color-border)'}
			opacity={visible ? 0.12 : 0.05}
			style="transition: all 0.8s ease"
		/>
		<rect x={hubX - 28} y={hubY - 22} width="56" height="44" rx="9"
			fill="none"
			stroke={visible ? '#15803d' : 'var(--color-border)'}
			stroke-width="1.5"
			opacity={visible ? 0.6 : 0.2}
			style="transition: all 0.8s ease"
		/>
		<text x={hubX} y={hubY - 2}
			text-anchor="middle"
			fill={visible ? '#15803d' : 'var(--color-text-muted)'}
			font-size="14" font-weight="700" font-family="JetBrains Mono, monospace"
			style="transition: all 0.8s ease"
		>.yaml</text>
		<text x={hubX} y={hubY + 14}
			text-anchor="middle"
			fill={visible ? '#1a1a1a' : 'var(--color-text-muted)'}
			font-size="8.5" font-weight="600" font-family="Inter, sans-serif"
			opacity={visible ? 0.6 : 0.3}
		>single source</text>

		<!-- Consumer labels -->
		{#each consumers as con, i}
			<rect x={con.x - 6} y={con.y - 10} width="52" height="20" rx="4"
				fill={visible ? '#0969a8' : 'var(--color-border)'}
				opacity={visible ? 0.06 : 0.03}
				style="transition: all 0.6s ease {i * 0.1}s"
			/>
			<text x={con.x + 20} y={con.y + 4}
				text-anchor="middle"
				fill={visible ? '#0969a8' : 'var(--color-text-muted)'}
				font-size="8" font-weight="600" font-family="Inter, sans-serif"
				opacity={visible ? 0.9 : 0.3}
				style="transition: all 0.6s ease {i * 0.1}s"
			>{con.label}</text>
		{/each}

		<!-- Flowing particles: sources → hub -->
		{#if visible}
			{#each particles as p}
				<circle cx={p.x} cy={p.y} r="2.5"
					fill={sources[p.sourceIdx].color}
					opacity={p.opacity}
				/>
			{/each}

			<!-- Flowing particles: hub → consumers -->
			{#each outParticles as p}
				<circle cx={p.x} cy={p.y} r="2"
					fill="#15803d"
					opacity={p.opacity}
				/>
			{/each}
		{/if}
	</svg>

	<div class="hub-caption">
		{#if visible}
			Five teams write YAML. Four languages read it. Everyone shares the same config files — no translation needed.
		{:else}
			<span style="opacity:0.5">Scroll down to see the animation</span>
		{/if}
	</div>
</div>

<style>
	.hub-container {
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow: hidden;
		margin: 2rem 0;
	}

	.hub-header {
		padding: 1.25rem 1.5rem 0.5rem;
	}

	.hub-header h3 {
		font-family: var(--font-ui);
		font-size: 0.95rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 0.3rem;
	}

	.hub-header p {
		font-family: var(--font-ui);
		font-size: 0.78rem;
		color: var(--color-text-muted);
		margin: 0;
	}

	.hub-svg {
		width: 100%;
		padding: 0.5rem 1rem;
		background: var(--color-bg-primary);
		margin: 0.5rem 1rem;
		border-radius: 10px;
		border: 1px solid var(--color-border);
		max-width: calc(100% - 2rem);
		display: block;
	}

	.hub-caption {
		padding: 0.75rem 1.5rem 1.25rem;
		font-family: var(--font-ui);
		font-size: 0.82rem;
		color: var(--color-text-muted);
		line-height: 1.6;
	}
</style>
