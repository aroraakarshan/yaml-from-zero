<script lang="ts">
let step = $state(-1);

interface Step {
yamlHighlight: number[]; // which yaml lines to highlight
title: string;
explain: string;
resolvedTitle: string;
resolvedLines: { text: string; source: 'template' | 'own' }[];
}

// The YAML lines (always visible, highlighted per step)
const yamlLines = [
'# Base configuration (the template)',
'base_config: &base_settings',
'  technology: "28nm"',
'  voltage: 1.2',
'  temperature: 25',
'',
'# Development environment',
'development:',
'  <<: *base_settings',
'  debug_mode: true',
'  waveform_dump: true',
'',
'# Production environment',
'production:',
'  <<: *base_settings',
'  debug_mode: false',
'  optimization_level: "high"',
];

const steps: Step[] = [
{
yamlHighlight: [0, 1, 2, 3, 4],
title: 'Step 1: Create the template',
explain: 'The & symbol creates a template called "base_settings." These three settings (technology, voltage, temperature) can now be reused anywhere.',
resolvedTitle: 'Template saved:',
resolvedLines: [
{ text: 'technology: "28nm"', source: 'template' },
{ text: 'voltage: 1.2', source: 'template' },
{ text: 'temperature: 25', source: 'template' },
],
},
{
yamlHighlight: [6, 7, 8, 9, 10],
title: 'Step 2: Development uses the template',
explain: '*base_settings copies all three values from the template. Then debug_mode and waveform_dump are added on top. Development gets 5 settings total — 3 inherited + 2 of its own.',
resolvedTitle: 'What development actually contains:',
resolvedLines: [
{ text: 'technology: "28nm"', source: 'template' },
{ text: 'voltage: 1.2', source: 'template' },
{ text: 'temperature: 25', source: 'template' },
{ text: 'debug_mode: true', source: 'own' },
{ text: 'waveform_dump: true', source: 'own' },
],
},
{
yamlHighlight: [12, 13, 14, 15, 16],
title: 'Step 3: Production uses the SAME template',
explain: 'Production also copies the same three base values, but adds different extras: debug_mode is false (not true), and optimization_level is added. Same template, different result.',
resolvedTitle: 'What production actually contains:',
resolvedLines: [
{ text: 'technology: "28nm"', source: 'template' },
{ text: 'voltage: 1.2', source: 'template' },
{ text: 'temperature: 25', source: 'template' },
{ text: 'debug_mode: false', source: 'own' },
{ text: 'optimization_level: "high"', source: 'own' },
],
},
];

let current = $derived(step >= 0 && step < steps.length ? steps[step] : null);
let highlightSet = $derived(new Set(current ? current.yamlHighlight : []));

function goTo(idx: number) {
step = Math.max(-1, Math.min(idx, steps.length - 1));
}
function replay() { step = -1; }
</script>

<div class="af-container">
<div class="af-header">
<h3>Interactive: How Anchors & Aliases Work</h3>
<p>Click Next — see the template being created, then watch it get copied into each environment</p>
</div>

<div class="af-split">
<!-- Left: YAML with highlights -->
<div class="af-code">
<div class="af-code-label">What you write:</div>
{#each yamlLines as line, i}
<div class="af-line" class:hl={highlightSet.has(i)} class:dim={current && !highlightSet.has(i)}>
{line || '\u00A0'}
</div>
{/each}
</div>

<!-- Right: Resolved output -->
<div class="af-resolved">
{#if current}
<div class="af-resolved-label">{current.resolvedTitle}</div>
{#each current.resolvedLines as line, i}
<div class="af-resolved-line" style="animation-delay: {i * 0.06}s;">
<span class="af-resolved-badge" class:template={line.source === 'template'} class:own={line.source === 'own'}>
{line.source === 'template' ? '← from template' : '← own setting'}
</span>
<span class="af-resolved-text">{line.text}</span>
</div>
{/each}
{:else}
<div class="af-resolved-label">Click Next to start</div>
<div class="af-resolved-hint">The left side shows what you write. The right side shows what YAML actually creates after resolving the template.</div>
{/if}
</div>
</div>

<!-- Explain -->
<div class="af-explain">
{#if current}
<strong>{current.title}</strong> — {current.explain}
{:else}
Anchors let you write settings once and reuse them in multiple places. Click Next to see how.
{/if}
</div>

<div class="af-footer">
<div class="af-controls">
<button class="dbtn" onclick={() => goTo(step - 1)} disabled={step <= 0}>Back</button>
<button class="dbtn dbtn-primary" onclick={() => goTo(step + 1)} disabled={step >= steps.length - 1}>
{step >= steps.length - 1 ? 'Done ✓' : 'Next'}
</button>
<button class="dbtn" onclick={replay}>↻ Reset</button>
</div>
</div>
</div>

<style>
.af-container {
background: var(--color-bg-secondary); border: 1px solid var(--color-border);
border-radius: 14px; overflow: hidden; margin: 2rem 0;
}
.af-header { padding: 1.25rem 1.5rem 0.75rem; }
.af-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
.af-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

.af-split {
display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
margin: 0 1.5rem; background: var(--color-border);
border-radius: 8px; overflow: hidden;
}

.af-code {
background: var(--color-bg-card); padding: 12px 0;
font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.9;
overflow: hidden;
}

.af-code-label {
font-family: var(--font-ui); font-size: 0.68rem; font-weight: 700;
text-transform: uppercase; letter-spacing: 0.06em;
color: var(--color-text-muted); padding: 0 16px 8px; 
}

.af-line {
padding: 1px 16px; white-space: pre; transition: all 0.3s ease;
}
.af-line.hl { background: var(--color-accent-bg); }
.af-line.dim { opacity: 0.3; }

.af-resolved {
background: var(--color-bg-primary); padding: 12px 20px;
overflow: hidden;
}

.af-resolved-label {
font-family: var(--font-ui); font-size: 0.72rem; font-weight: 700;
text-transform: uppercase; letter-spacing: 0.06em;
color: var(--color-text-muted); margin-bottom: 12px;
}

.af-resolved-hint {
font-family: var(--font-ui); font-size: 0.82rem; color: var(--color-text-muted);
line-height: 1.6;
}

.af-resolved-line {
display: flex; flex-direction: column; gap: 2px;
padding: 8px 12px; margin-bottom: 6px;
background: var(--color-bg-card); border: 1px solid var(--color-border);
border-radius: 6px;
animation: slideIn 0.25s ease forwards; opacity: 0;
}

.af-resolved-badge {
font-family: var(--font-ui); font-size: 0.62rem; font-weight: 600;
text-transform: uppercase; letter-spacing: 0.04em;
}
.af-resolved-badge.template { color: #15803d; }
.af-resolved-badge.own { color: #0969a8; }

.af-resolved-text {
font-family: var(--font-mono); font-size: 0.8rem; color: var(--color-text-primary);
}

.af-explain {
font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
color: var(--color-text-secondary);
background: var(--color-bg-primary); border: 1px solid var(--color-border);
border-radius: 8px; padding: 14px 18px;
margin: 0.75rem 1.5rem; height: 90px; overflow-y: auto;
}

.af-footer { padding: 0.75rem 1.5rem 1.25rem; }
.af-controls { display: flex; gap: 8px; }

@keyframes slideIn {
from { opacity: 0; transform: translateY(4px); }
to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
.af-split { grid-template-columns: 1fr; }
}
</style>
