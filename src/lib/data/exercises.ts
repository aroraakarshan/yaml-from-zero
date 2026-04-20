import {
	hasKey,
	hasStringKey,
	hasNumberKey,
	hasBooleanKey,
	hasListKey,
	hasListWithMinItems,
	hasNestedKey,
	hasComment,
	hasMinKeys,
	type PracticeExercise
} from '$lib/editor/exercise-checker.js';

/**
 * Exercises organized by lesson slug.
 * Each lesson can have multiple exercises, progressing in difficulty.
 */
export const exercisesByLesson: Record<string, PracticeExercise[]> = {
	/* ─────────────────────────────────────────────
	 * Lesson 1: What is YAML?
	 * (Light intro — just get comfortable typing)
	 * ───────────────────────────────────────────── */
	'lesson-01': [
		{
			id: 'l01-first-pair',
			title: 'Write your first key-value pair',
			instructions:
				'YAML stores information as key: value pairs. Write a single key called "name" with any text value you like. Remember: there must be a space after the colon!',
			starterCode: '# Type your first YAML below\n',
			hints: [
				'The format is: key: value',
				'Try: name: "My First Chip"',
				'Make sure there is exactly one space after the colon'
			],
			checks: [hasKey('name'), hasStringKey('name')]
		}
	],

	/* ─────────────────────────────────────────────
	 * Lesson 2: Writing Your First YAML
	 * (Key-value pairs, comments, data types)
	 * ───────────────────────────────────────────── */
	'lesson-02': [
		{
			id: 'l02-data-types',
			title: 'Use all three data types',
			instructions:
				'Write a YAML file with at least 3 keys: one with a text (string) value, one with a number, and one with a boolean (true/false). Add a comment at the top describing what your file is about.',
			starterCode: '# Describe your file here\n',
			hints: [
				'Strings can be plain text or wrapped in quotes',
				'Numbers are written without quotes: frequency: 100',
				'Booleans are just: enabled: true'
			],
			checks: [
				hasComment(),
				hasMinKeys(3),
				{
					description: 'Has at least one string value',
					validate: (parsed) =>
						isObj(parsed) && Object.values(parsed).some((v) => typeof v === 'string')
				},
				{
					description: 'Has at least one number value',
					validate: (parsed) =>
						isObj(parsed) && Object.values(parsed).some((v) => typeof v === 'number')
				},
				{
					description: 'Has at least one boolean value',
					validate: (parsed) =>
						isObj(parsed) && Object.values(parsed).some((v) => typeof v === 'boolean')
				}
			]
		}
	],

	/* ─────────────────────────────────────────────
	 * Lesson 3: Organizing with Nesting
	 * (Indentation, nested objects)
	 * ───────────────────────────────────────────── */
	'lesson-03': [
		{
			id: 'l03-nested-config',
			title: 'Create a nested configuration',
			instructions:
				'Create a YAML config with a top-level key called "server" that contains nested keys for "host" (a string) and "port" (a number). Remember: use 2 spaces for indentation!',
			starterCode: '',
			hints: [
				'Start with "server:" on its own line (no value after the colon)',
				'Indent the child keys by 2 spaces: ··host: "localhost"',
				'port should be a number like 8080, no quotes needed'
			],
			checks: [
				hasKey('server'),
				hasNestedKey(['server', 'host']),
				hasNestedKey(['server', 'port']),
				{
					description: '"server → host" is a string',
					validate: (parsed) =>
						isObj(parsed) &&
						isObj(parsed.server) &&
						typeof parsed.server.host === 'string'
				},
				{
					description: '"server → port" is a number',
					validate: (parsed) =>
						isObj(parsed) &&
						isObj(parsed.server) &&
						typeof parsed.server.port === 'number'
				}
			]
		}
	],

	/* ─────────────────────────────────────────────
	 * Lesson 4: Making Lists
	 * (Simple lists, lists of objects)
	 * ───────────────────────────────────────────── */
	'lesson-04': [
		{
			id: 'l04-simple-list',
			title: 'Write a list of items',
			instructions:
				'Create a key called "tests" that contains a list of at least 3 test names. Use the dash (-) syntax for list items.',
			starterCode: '# List your tests below\n',
			hints: [
				'Start with "tests:" on its own line',
				'Each item starts with a dash: ··- "speed_test"',
				'Make sure all dashes are at the same indent level (2 spaces)'
			],
			checks: [
				hasKey('tests'),
				hasListKey('tests'),
				hasListWithMinItems('tests', 3)
			]
		},
		{
			id: 'l04-list-of-objects',
			title: 'Make a list of objects',
			instructions:
				'Create a key called "team" containing a list of at least 2 people. Each person should have a "name" (string) and a "role" (string).',
			starterCode: '',
			hints: [
				'Start each person with a dash, then put key-value pairs on the same line or indented below',
				'Example: ··- name: "Alice"\\n····role: "Engineer"',
				'The second person follows the same pattern at the same indent level'
			],
			checks: [
				hasKey('team'),
				hasListKey('team'),
				hasListWithMinItems('team', 2),
				{
					description: 'Each team member has "name" and "role"',
					validate: (parsed) =>
						isObj(parsed) &&
						Array.isArray(parsed.team) &&
						parsed.team.length >= 2 &&
						parsed.team.every(
							(p: unknown) =>
								isObj(p) && typeof p.name === 'string' && typeof p.role === 'string'
						)
				}
			]
		}
	],

	/* ─────────────────────────────────────────────
	 * Lesson 5: Long Text & Multi-line
	 * (Pipe and fold operators)
	 * ───────────────────────────────────────────── */
	'lesson-05': [
		{
			id: 'l05-multiline',
			title: 'Use multi-line text',
			instructions:
				'Create a key called "description" that uses the pipe (|) operator for a multi-line block of text. Write at least 2 lines of description text below it.',
			starterCode: '',
			hints: [
				'The pipe goes right after the colon: description: |',
				'The text lines are indented under the key (2 spaces)',
				'Each line becomes a separate line in the final text'
			],
			checks: [
				hasKey('description'),
				{
					description: 'Uses the pipe (|) operator for multi-line text',
					validate: (_parsed, raw) => /:\s*\|/.test(raw)
				},
				{
					description: '"description" contains at least 2 lines of text',
					validate: (parsed) =>
						isObj(parsed) &&
						typeof parsed.description === 'string' &&
						parsed.description.trim().split('\n').length >= 2
				}
			]
		}
	]
};

function isObj(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}
