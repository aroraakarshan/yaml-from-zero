import { modules } from './modules';
import glossaryRaw from '../../routes/glossary/+page.svx?raw';

export interface SearchEntry {
	type: 'lesson' | 'glossary';
	title: string;
	subtitle: string;
	url: string;
	haystack: string;
}

function parseGlossary(md: string): SearchEntry[] {
	const entries: SearchEntry[] = [];
	const re = /^\*\*([^*]+)\*\*\s*[—-]\s*([^\n]+)$/gm;
	let m: RegExpExecArray | null;
	while ((m = re.exec(md)) !== null) {
		const term = m[1].trim();
		const def = m[2].replace(/\*Lesson[^*]*\*/g, '').trim();
		entries.push({
			type: 'glossary',
			title: term,
			subtitle: def,
			url: `/glossary#${term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
			haystack: (term + ' ' + def).toLowerCase()
		});
	}
	return entries;
}

const lessonEntries: SearchEntry[] = modules.flatMap((mod) =>
	mod.lessons.map((l) => ({
		type: 'lesson' as const,
		title: l.title,
		subtitle: `Part ${mod.id} · ${mod.title}`,
		url: `/${l.slug}`,
		haystack: (l.title + ' ' + l.description + ' ' + mod.title).toLowerCase()
	}))
);

export const searchIndex: SearchEntry[] = [
	...lessonEntries,
	{
		type: 'lesson',
		title: 'Glossary',
		subtitle: 'Every technical word in plain English',
		url: '/glossary',
		haystack: 'glossary terms definitions reference lookup'
	},
	...parseGlossary(glossaryRaw)
];

export function searchAll(query: string, limit = 12): SearchEntry[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const tokens = q.split(/\s+/);
	const scored: { e: SearchEntry; score: number }[] = [];
	for (const e of searchIndex) {
		let score = 0;
		let allMatch = true;
		for (const t of tokens) {
			const i = e.haystack.indexOf(t);
			if (i === -1) {
				allMatch = false;
				break;
			}
			score += 100 - Math.min(i, 90);
			if (e.title.toLowerCase().includes(t)) score += 50;
			if (e.title.toLowerCase().startsWith(t)) score += 30;
		}
		if (allMatch) scored.push({ e, score });
	}
	scored.sort((a, b) => b.score - a.score);
	return scored.slice(0, limit).map((s) => s.e);
}
