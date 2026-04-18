import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { createHighlighter } from 'shiki';

const highlighter = await createHighlighter({
	themes: ['github-light'],
	langs: ['yaml', 'tcl', 'xml', 'ini', 'bash', 'python', 'json']
});

function shikiHighlight(code, lang) {
	if (!lang) return `<pre><code>${code}</code></pre>`;
	try {
		return highlighter.codeToHtml(code, { lang, theme: 'github-light' });
	} catch {
		return `<pre><code>${code}</code></pre>`;
	}
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({ fallback: '404.html' }),
		paths: { base: process.env.BASE_PATH ?? '' },
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				if (path.startsWith('/lesson-') || path === '/' || path === '/glossary') return;
				throw new Error(`${message} (linked from ${referrer})`);
			}
		}
	},
	preprocess: [mdsvex({ extensions: ['.svx', '.md'], highlight: { highlighter: shikiHighlight } })],
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
