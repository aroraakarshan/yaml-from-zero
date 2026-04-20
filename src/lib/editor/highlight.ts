import { createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;
let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create a singleton Shiki highlighter for the practice editor.
 * Lazy-initialized on first use, shared across all editor instances.
 */
export async function getShikiHighlighter(): Promise<Highlighter> {
	if (highlighterInstance) return highlighterInstance;
	if (highlighterPromise) return highlighterPromise;

	highlighterPromise = createHighlighter({
		themes: ['github-light'],
		langs: ['yaml']
	}).then((h) => {
		highlighterInstance = h;
		return h;
	});

	return highlighterPromise;
}

/**
 * Highlight YAML code and return HTML string.
 * Returns plain text wrapped in pre/code if highlighter isn't ready.
 */
export async function highlightYaml(code: string): Promise<string> {
	try {
		const h = await getShikiHighlighter();
		return h.codeToHtml(code || ' ', { lang: 'yaml', theme: 'github-light' });
	} catch {
		const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return `<pre><code>${escaped}</code></pre>`;
	}
}
