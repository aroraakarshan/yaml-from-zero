#!/usr/bin/env node
// Rewrites absolute internal hrefs in built HTML to include BASE_PATH.
// Source files use `href="/lesson-XX"` for clean dev DX. After SvelteKit
// builds with adapter-static + paths.base, asset URLs are correctly prefixed,
// but raw `<a href="/...">` attributes in .svx files are not. This script
// fixes those in the built artefacts only.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';

const BASE = process.env.BASE_PATH || '';
if (!BASE) {
	console.log('[fix-base-paths] BASE_PATH empty; nothing to do.');
	process.exit(0);
}

const BUILD = 'build';
const targets = [/href="\/lesson-/g, /href="\/glossary/g, /href="\/"/g];
const replacements = [`href="${BASE}/lesson-`, `href="${BASE}/glossary`, `href="${BASE}/"`];

async function* walk(dir) {
	for (const entry of await readdir(dir)) {
		const p = join(dir, entry);
		const s = await stat(p);
		if (s.isDirectory()) yield* walk(p);
		else if (entry.endsWith('.html')) yield p;
	}
}

let touched = 0;
for await (const file of walk(BUILD)) {
	let html = await readFile(file, 'utf8');
	const before = html;
	targets.forEach((re, i) => {
		html = html.replace(re, replacements[i]);
	});
	if (html !== before) {
		await writeFile(file, html);
		touched++;
	}
}
console.log(`[fix-base-paths] BASE=${BASE}; rewrote ${touched} HTML file(s).`);
