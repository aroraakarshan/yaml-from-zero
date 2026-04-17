<script lang="ts">
let expanded = $state<Record<string, boolean>>({
chip_info: false,
capabilities: false,
specifications: false,
required_tests: false,
});

function toggle(key: string) {
expanded[key] = !expanded[key];
}
</script>

<div class="ln-container">
<div class="ln-header">
<h3>Interactive: USB Controller — The Complete File</h3>
<p>Click each section to explore — this is the book's exact USB controller example</p>
</div>

<div class="ln-split">
<!-- Left: clickable pockets -->
<div class="ln-visual">
<div class="ln-parent-label">
<span>🔌</span>
<span><strong>usb_controller</strong></span>
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ln-pocket" class:open={expanded.chip_info} style="--pocket-color: #0969a8;" onclick={() => toggle('chip_info')}>
<div class="ln-pocket-head">
<span>ℹ️</span>
<span class="ln-pocket-name">chip_info</span>
<span class="ln-pocket-type">nested group</span>
<span class="ln-pocket-arrow">{expanded.chip_info ? '▾' : '▸'}</span>
</div>
{#if expanded.chip_info}
<div class="ln-pocket-items">
<div class="ln-pocket-item"><span class="ln-pk">name:</span> <span class="ln-pv-str">"Simple USB Controller"</span></div>
<div class="ln-pocket-item"><span class="ln-pk">version:</span> <span class="ln-pv-str">"1.0"</span></div>
<div class="ln-pocket-item"><span class="ln-pk">designer:</span> <span class="ln-pv-str">"Student Engineer"</span></div>
<div class="ln-pocket-item"><span class="ln-pk">date_designed:</span> <span class="ln-pv-str">"2024-01-15"</span></div>
<div class="ln-pocket-item"><span class="ln-pk">description:</span> <span class="ln-pv-pipe">|</span> <span class="ln-pv-hint">(keeps line breaks)</span></div>
<div class="ln-pocket-item ln-pocket-sub">&nbsp;&nbsp;A simple USB 2.0 controller chip...</div>
<div class="ln-pocket-item"><span class="ln-pk">summary:</span> <span class="ln-pv-pipe">></span> <span class="ln-pv-hint">(folds into one line)</span></div>
<div class="ln-pocket-item ln-pocket-sub">&nbsp;&nbsp;A beginner-friendly USB controller...</div>
</div>
{/if}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ln-pocket" class:open={expanded.capabilities} style="--pocket-color: #7c3aed;" onclick={() => toggle('capabilities')}>
<div class="ln-pocket-head">
<span>⚡</span>
<span class="ln-pocket-name">capabilities</span>
<span class="ln-pocket-type">nested group</span>
<span class="ln-pocket-arrow">{expanded.capabilities ? '▾' : '▸'}</span>
</div>
{#if expanded.capabilities}
<div class="ln-pocket-items">
<div class="ln-pocket-item"><span class="ln-pk">usb_version:</span> <span class="ln-pv-str">"2.0"</span></div>
<div class="ln-pocket-item"><span class="ln-pk">max_speed:</span> <span class="ln-pv-str">"480"</span></div>
<div class="ln-pocket-item"><span class="ln-pk">number_of_ports:</span> <span class="ln-pv-num">4</span></div>
<div class="ln-pocket-item"><span class="ln-pk">power_saving:</span> <span class="ln-pv-bool">true</span></div>
</div>
{/if}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ln-pocket" class:open={expanded.specifications} style="--pocket-color: #b45309;" onclick={() => toggle('specifications')}>
<div class="ln-pocket-head">
<span>📐</span>
<span class="ln-pocket-name">specifications</span>
<span class="ln-pocket-type">nested group</span>
<span class="ln-pocket-arrow">{expanded.specifications ? '▾' : '▸'}</span>
</div>
{#if expanded.specifications}
<div class="ln-pocket-items">
<div class="ln-pocket-item"><span class="ln-pk">voltage:</span> <span class="ln-pv-num">3.3</span></div>
<div class="ln-pocket-item"><span class="ln-pk">frequency:</span> <span class="ln-pv-num">48</span></div>
<div class="ln-pocket-item"><span class="ln-pk">package_type:</span> <span class="ln-pv-str">"BGA"</span></div>
<div class="ln-pocket-item"><span class="ln-pk">pin_count:</span> <span class="ln-pv-num">64</span></div>
</div>
{/if}
</div>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="ln-pocket" class:open={expanded.required_tests} style="--pocket-color: #dc2626;" onclick={() => toggle('required_tests')}>
<div class="ln-pocket-head">
<span>🧪</span>
<span class="ln-pocket-name">required_tests</span>
<span class="ln-pocket-type">simple list</span>
<span class="ln-pocket-arrow">{expanded.required_tests ? '▾' : '▸'}</span>
</div>
{#if expanded.required_tests}
<div class="ln-pocket-items">
<div class="ln-pocket-item"><span class="ln-pd">-</span> <span class="ln-pv-str">"basic_connection_test"</span></div>
<div class="ln-pocket-item"><span class="ln-pd">-</span> <span class="ln-pv-str">"data_transfer_test"</span></div>
<div class="ln-pocket-item"><span class="ln-pd">-</span> <span class="ln-pv-str">"power_consumption_test"</span></div>
<div class="ln-pocket-item"><span class="ln-pd">-</span> <span class="ln-pv-str">"temperature_test"</span></div>
<div class="ln-pocket-item"><span class="ln-pd">-</span> <span class="ln-pv-str">"compatibility_test"</span></div>
</div>
{/if}
</div>
</div>

<!-- Right: Full YAML with highlights -->
<div class="ln-yaml">
<div class="ln-yl"><span class="ln-yk">usb_controller</span><span class="ln-yc">:</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;<span class="ln-yk">chip_info</span><span class="ln-yc">:</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">name</span><span class="ln-yc">: </span><span class="ln-yv-str">"Simple USB Controller"</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">version</span><span class="ln-yc">: </span><span class="ln-yv-str">"1.0"</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">designer</span><span class="ln-yc">: </span><span class="ln-yv-str">"Student Engineer"</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">date_designed</span><span class="ln-yc">: </span><span class="ln-yv-str">"2024-01-15"</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">description</span><span class="ln-yc">: </span><span class="ln-yv-pipe">|</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yv-str">A simple USB 2.0 controller</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yv-str">designed for learning purposes.</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">summary</span><span class="ln-yc">: </span><span class="ln-yv-pipe">></span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yv-str">A beginner-friendly USB</span></div>
<div class="ln-yl" class:hl={expanded.chip_info}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yv-str">controller for learning.</span></div>
<div class="ln-yl" class:hl={expanded.capabilities}>&nbsp;&nbsp;<span class="ln-yk">capabilities</span><span class="ln-yc">:</span></div>
<div class="ln-yl" class:hl={expanded.capabilities}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">usb_version</span><span class="ln-yc">: </span><span class="ln-yv-str">"2.0"</span></div>
<div class="ln-yl" class:hl={expanded.capabilities}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">max_speed</span><span class="ln-yc">: </span><span class="ln-yv-str">"480"</span></div>
<div class="ln-yl" class:hl={expanded.capabilities}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">number_of_ports</span><span class="ln-yc">: </span><span class="ln-yv-num">4</span></div>
<div class="ln-yl" class:hl={expanded.capabilities}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">power_saving</span><span class="ln-yc">: </span><span class="ln-yv-bool">true</span></div>
<div class="ln-yl" class:hl={expanded.specifications}>&nbsp;&nbsp;<span class="ln-yk">specifications</span><span class="ln-yc">:</span></div>
<div class="ln-yl" class:hl={expanded.specifications}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">voltage</span><span class="ln-yc">: </span><span class="ln-yv-num">3.3</span></div>
<div class="ln-yl" class:hl={expanded.specifications}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">frequency</span><span class="ln-yc">: </span><span class="ln-yv-num">48</span></div>
<div class="ln-yl" class:hl={expanded.specifications}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">package_type</span><span class="ln-yc">: </span><span class="ln-yv-str">"BGA"</span></div>
<div class="ln-yl" class:hl={expanded.specifications}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yk">pin_count</span><span class="ln-yc">: </span><span class="ln-yv-num">64</span></div>
<div class="ln-yl" class:hl={expanded.required_tests}>&nbsp;&nbsp;<span class="ln-yk">required_tests</span><span class="ln-yc">:</span></div>
<div class="ln-yl" class:hl={expanded.required_tests}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yd">-</span> <span class="ln-yv-str">"basic_connection_test"</span></div>
<div class="ln-yl" class:hl={expanded.required_tests}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yd">-</span> <span class="ln-yv-str">"data_transfer_test"</span></div>
<div class="ln-yl" class:hl={expanded.required_tests}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yd">-</span> <span class="ln-yv-str">"power_consumption_test"</span></div>
<div class="ln-yl" class:hl={expanded.required_tests}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yd">-</span> <span class="ln-yv-str">"temperature_test"</span></div>
<div class="ln-yl" class:hl={expanded.required_tests}>&nbsp;&nbsp;&nbsp;&nbsp;<span class="ln-yd">-</span> <span class="ln-yv-str">"compatibility_test"</span></div>
</div>
</div>
</div>

<style>
.ln-container {
background: var(--color-bg-secondary); border: 1px solid var(--color-border);
border-radius: 14px; overflow: hidden; margin: 2rem 0;
}
.ln-header { padding: 1.25rem 1.5rem 0.75rem; }
.ln-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
.ln-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

.ln-split {
display: grid; grid-template-columns: 1fr 1fr; gap: 2px;
margin: 0.75rem 1.5rem 1.25rem;
background: var(--color-border); border-radius: 8px; overflow: hidden;
}

.ln-visual { background: var(--color-bg-card); padding: 20px 24px; }
.ln-parent-label {
display: flex; align-items: center; gap: 8px;
font-family: var(--font-ui); font-size: 0.85rem; color: var(--color-text-secondary);
margin-bottom: 14px;
}

.ln-pocket {
border: 1px solid var(--color-border); border-radius: 8px;
margin-bottom: 8px; overflow: hidden; cursor: pointer;
transition: border-color 0.2s;
}
.ln-pocket:hover { border-color: var(--pocket-color); }
.ln-pocket.open { border-color: var(--pocket-color); }

.ln-pocket-head {
display: flex; align-items: center; gap: 8px;
padding: 10px 14px; background: var(--color-bg-primary);
font-family: var(--font-ui); font-size: 0.82rem; font-weight: 600;
color: var(--color-text-primary);
}
.ln-pocket.open .ln-pocket-head { color: var(--pocket-color); }
.ln-pocket-name { flex: 1; }
.ln-pocket-type {
font-size: 0.65rem; font-weight: 600; text-transform: uppercase;
letter-spacing: 0.05em; color: var(--color-text-muted);
background: var(--color-bg-secondary); padding: 2px 8px; border-radius: 3px;
}
.ln-pocket.open .ln-pocket-type { color: var(--pocket-color); background: color-mix(in srgb, var(--pocket-color) 8%, var(--color-bg-secondary)); }
.ln-pocket-arrow { font-size: 0.75rem; color: var(--color-text-muted); }

.ln-pocket-items { padding: 10px 14px 14px; }
.ln-pocket-item {
font-family: var(--font-mono); font-size: 0.78rem; line-height: 2;
animation: slideIn 0.2s ease forwards; opacity: 0;
}
.ln-pk { color: #0969a8; font-weight: 600; }
.ln-pd { color: #c45d2c; font-weight: 700; }
.ln-pv-str { color: #1a7f37; }
.ln-pv-num { color: #7c3aed; }
.ln-pv-bool { color: #c45d2c; }
.ln-pv-pipe { color: #c45d2c; font-weight: 700; }
.ln-pv-hint { color: var(--color-text-muted); font-size: 0.68rem; font-family: var(--font-ui); font-style: italic; }
.ln-pocket-sub { color: #1a7f37; font-size: 0.72rem; opacity: 0.7; }

.ln-yaml {
background: var(--color-bg-primary); padding: 20px 24px;
font-family: var(--font-mono); font-size: 0.78rem; line-height: 1.9;
}
.ln-yl {
white-space: pre; padding: 2px 6px; border-radius: 3px;
transition: background 0.2s;
}
.ln-yl.hl { background: var(--color-accent-bg); }
.ln-yk { color: #0969a8; font-weight: 600; }
.ln-yc { color: var(--color-text-muted); }
.ln-yd { color: #c45d2c; font-weight: 700; }
.ln-yv-str { color: #1a7f37; }
.ln-yv-num { color: #7c3aed; }
.ln-yv-bool { color: #c45d2c; }
.ln-yv-pipe { color: #c45d2c; font-weight: 700; }

@keyframes slideIn {
from { opacity: 0; transform: translateX(-6px); }
to { opacity: 1; transform: translateX(0); }
}

@media (max-width: 600px) {
.ln-split { grid-template-columns: 1fr; }
}
</style>
