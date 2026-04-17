<script lang="ts">
	const readExample = `import yaml

# Read the YAML file
with open('chip_config.yaml') as f:
    config = yaml.safe_load(f)

# Access values — just like a dictionary!
print(config['base_config']['technology'])  # "28nm"
print(config['development']['debug_mode'])  # True`;

	const writeExample = `import yaml

config = {
    'project_name': 'My Chip',
    'frequency_mhz': 100,
    'debug_mode': True
}

with open('output.yaml', 'w') as f:
    yaml.dump(config, f, default_flow_style=False)`;

	const installCmd = `pip install pyyaml`;
</script>

<div class="py-container">
	<div class="py-header">
		<h3>Using YAML with Python</h3>
		<p>Python is the most common language for reading YAML in semiconductor design</p>
	</div>

	<div class="py-body">
		<div class="py-section">
			<div class="py-label">Install the library:</div>
			<pre class="py-code"><code>{installCmd}</code></pre>
		</div>

		<div class="py-section">
			<div class="py-label">Reading a YAML file:</div>
			<pre class="py-code"><code>{readExample}</code></pre>
		</div>

		<div class="py-section">
			<div class="py-label">Writing a YAML file:</div>
			<pre class="py-code"><code>{writeExample}</code></pre>
		</div>

		<div class="py-note">
			Python reads YAML into a dictionary — you access values with square brackets, just like you would access items in a list. That is all there is to it.
		</div>
	</div>
</div>

<style>
	.py-container {
		background: var(--color-bg-secondary); border: 1px solid var(--color-border);
		border-radius: 14px; overflow: hidden; margin: 2rem 0;
	}
	.py-header { padding: 1.25rem 1.5rem 0.75rem; }
	.py-header h3 { font-family: var(--font-ui); font-size: 0.95rem; font-weight: 700; color: var(--color-text-primary); margin: 0 0 0.3rem; }
	.py-header p { font-family: var(--font-ui); font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }

	.py-body { padding: 0 1.5rem 1.25rem; }

	.py-section { margin-bottom: 16px; }

	.py-label {
		font-family: var(--font-ui); font-size: 0.75rem; font-weight: 600;
		color: var(--color-text-muted); text-transform: uppercase;
		letter-spacing: 0.06em; margin-bottom: 6px;
	}

	.py-code {
		font-family: var(--font-mono); font-size: 0.82rem; line-height: 1.8;
		background: var(--color-bg-card); border: 1px solid var(--color-border);
		border-radius: 8px; padding: 16px 20px; margin: 0;
		overflow-x: auto; white-space: pre;
	}

	.py-note {
		font-family: var(--font-ui); font-size: 0.82rem; line-height: 1.6;
		color: var(--color-text-secondary);
		background: var(--color-bg-primary); border: 1px solid var(--color-border);
		border-radius: 8px; padding: 12px 16px;
	}
</style>
