<script lang="ts">
	import './layout.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import ScrollProgress from '$lib/components/ScrollProgress.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/state';

	let { children } = $props();

	onMount(() => {
		const scrollRoot = document.getElementById('main-scroll');

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					} else if (entry.boundingClientRect.top > 0) {
						// Element scrolled below the viewport — reset so it can fade in again
						entry.target.classList.remove('visible');
					}
				}
			},
			{ root: scrollRoot, threshold: 0.1 }
		);

		function tagAndObserve() {
			const proseSelectors =
				'.prose > h1, .prose > h2, .prose > h3, .prose > p, .prose > table, .prose > blockquote, .prose > ul, .prose > ol, .prose > hr, .prose > pre, .prose > .not-prose, .prose > div';
			document.querySelectorAll(proseSelectors).forEach((el, i) => {
				if (!el.classList.contains('animate-in')) {
					el.classList.add('animate-in');
					(el as HTMLElement).style.transitionDelay = `${Math.min(i * 0.04, 0.2)}s`;
					observer.observe(el);
				}
			});
		}

		function buildTOC() {
			const tocNav = document.getElementById('toc-nav');
			if (!tocNav) return;
			tocNav.innerHTML = '';
			const headings = document.querySelectorAll(
				'#lesson-content h2, #lesson-content h3'
			);
			headings.forEach((h, i) => {
				const id = h.id || `heading-${i}`;
				h.id = id;
				const a = document.createElement('a');
				a.href = `#${id}`;
				a.textContent = h.textContent || '';
				if (h.tagName === 'H3') a.classList.add('toc-h3');
				a.addEventListener('click', (e) => {
					e.preventDefault();
					document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
				});
				tocNav.appendChild(a);
			});
		}

		let headingObserver: IntersectionObserver;
		function observeHeadings() {
			const tocNav = document.getElementById('toc-nav');
			if (!tocNav) return;
			const links = tocNav.querySelectorAll('a');

			if (headingObserver) headingObserver.disconnect();
			headingObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							links.forEach((l) => l.classList.remove('active'));
							const active = tocNav.querySelector(
								`a[href="#${entry.target.id}"]`
							);
							if (active) active.classList.add('active');
						}
					}
				},
				{ root: scrollRoot, rootMargin: '-10% 0px -80% 0px' }
			);
			document
				.querySelectorAll('#lesson-content h2, #lesson-content h3')
				.forEach((h) => {
					headingObserver.observe(h);
				});
		}

		tagAndObserve();
		buildTOC();
		observeHeadings();

		$effect(() => {
			page.url.pathname;
			requestAnimationFrame(() => {
				tagAndObserve();
				buildTOC();
				observeHeadings();
				const mainEl = document.getElementById('main-scroll');
				if (mainEl) mainEl.scrollTop = 0;
			});
		});

		return () => {
			observer.disconnect();
			if (headingObserver) headingObserver.disconnect();
		};
	});
</script>

<ScrollProgress />

<div class="app-shell">
	<Sidebar />

	<main class="main-content" id="main-scroll">
		<div class="content-inner">
			<article class="prose max-w-none" id="lesson-content">
				{@render children()}
			</article>
		</div>
	</main>

	<aside class="toc" id="toc-sidebar">
		<div class="toc-title">On this page</div>
		<nav class="toc-nav" id="toc-nav"></nav>
	</aside>
</div>

<style>
	.app-shell {
		display: flex;
		max-width: 1400px;
		margin: 0 auto;
		height: 100vh;
		overflow: hidden;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: none;
	}

	.main-content::-webkit-scrollbar {
		display: none;
	}

	.content-inner {
		max-width: 44rem;
		margin: 0 auto;
		padding: 2rem 2rem 4rem;
	}

	.toc {
		width: 180px;
		flex-shrink: 0;
		overflow-y: auto;
		padding: 1.5rem 1rem 1.5rem 0;
	}

	.toc-title {
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-bottom: 0.75rem;
		padding-left: 0.75rem;
	}

	:global(.toc-nav a) {
		display: block;
		padding: 0.3rem 0.75rem;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		text-decoration: none;
		border-left: 2px solid transparent;
		transition: all 0.15s ease;
		line-height: 1.4;
	}

	:global(.toc-nav a:hover) {
		color: var(--color-text-primary);
	}

	:global(.toc-nav a.active) {
		color: var(--color-accent);
		border-left-color: var(--color-accent);
	}

	:global(.toc-nav a.toc-h3) {
		padding-left: 1.5rem;
		font-size: 0.7rem;
	}

	@media (max-width: 1100px) {
		.toc {
			display: none;
		}
	}

	@media (max-width: 768px) {
		.content-inner {
			padding: 1.5rem 1rem 3rem;
		}
	}
</style>
