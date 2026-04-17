<script lang="ts">
	let {
		tag = 'general',
		variant = 'full'
	}: {
		tag?: string;
		variant?: 'full' | 'compact';
	} = $props();

	let email = $state('');
	let status = $state<'idle' | 'loading' | 'success' | 'error'>('idle');
	let errorMsg = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		if (!email.trim()) return;
		status = 'loading';
		errorMsg = '';

		try {
			const fd = new FormData();
			fd.append('email', email.trim());
			fd.append('tag', tag);
			fd.append('embed', '1');

			const res = await fetch(
				'https://buttondown.com/api/emails/embed-subscribe/akarshanarora',
				{ method: 'POST', body: fd, mode: 'no-cors' }
			);
			// no-cors means we can't read the response, but the POST succeeded if no throw
			status = 'success';
			email = '';
		} catch (err) {
			status = 'error';
			errorMsg = 'Something went wrong. Please try again.';
		}
	}
</script>

<div class="nl-card" class:compact={variant === 'compact'}>
	{#if variant === 'full'}
		<div class="nl-eyebrow">Newsletter · Free · No spam</div>
		<h3 class="nl-title">Get notified when new lessons drop</h3>
		<p class="nl-sub">
			One short email when a new chapter or sibling tutorial (Python from Zero is next) goes live.
			Unsubscribe any time.
		</p>
	{:else}
		<h3 class="nl-title-compact">Liked this? Get the next one in your inbox.</h3>
	{/if}

	{#if status === 'success'}
		<div class="nl-success">
			✓ Almost there — check your inbox for a confirmation link.
		</div>
	{:else}
		<form class="nl-form" onsubmit={submit}>
			<input
				type="email"
				required
				placeholder="you@example.com"
				bind:value={email}
				disabled={status === 'loading'}
				autocomplete="email"
			/>
			<button type="submit" disabled={status === 'loading'}>
				{status === 'loading' ? 'Subscribing…' : 'Subscribe'}
			</button>
		</form>
		{#if status === 'error'}
			<div class="nl-error">{errorMsg}</div>
		{/if}
	{/if}
</div>

<style>
	.nl-card {
		background: var(--color-bg-card);
		border: 1px solid var(--color-border);
		border-left: 4px solid var(--color-accent);
		border-radius: 8px;
		padding: 1.5rem 1.5rem;
		margin: 2rem 0;
	}
	.nl-card.compact {
		padding: 1rem 1.25rem;
		margin: 1.5rem 0;
	}

	.nl-eyebrow {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--color-accent);
		margin-bottom: 0.5rem;
	}
	.nl-title {
		font-size: 1.1rem;
		margin: 0 0 0.35rem;
		color: var(--color-text-primary);
	}
	.nl-title-compact {
		font-size: 0.95rem;
		margin: 0 0 0.6rem;
		color: var(--color-text-primary);
	}
	.nl-sub {
		font-size: 0.85rem;
		color: var(--color-text-muted);
		margin: 0 0 1rem;
		line-height: 1.5;
	}
	.nl-form {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.nl-form input {
		flex: 1;
		min-width: 200px;
		padding: 0.55rem 0.8rem;
		border: 1px solid var(--color-border);
		border-radius: 6px;
		background: var(--color-bg);
		color: var(--color-text-primary);
		font-family: inherit;
		font-size: 0.9rem;
	}
	.nl-form input:focus {
		outline: none;
		border-color: var(--color-accent);
	}
	.nl-form button {
		padding: 0.55rem 1.1rem;
		background: var(--color-accent);
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		font-family: inherit;
		font-size: 0.85rem;
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.nl-form button:hover:not(:disabled) {
		opacity: 0.9;
	}
	.nl-form button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.nl-success {
		color: var(--color-accent);
		font-weight: 500;
		font-size: 0.9rem;
		padding: 0.5rem 0;
	}
	.nl-error {
		color: #c0392b;
		font-size: 0.8rem;
		margin-top: 0.5rem;
	}
</style>
