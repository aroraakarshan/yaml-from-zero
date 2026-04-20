import type { ValidationResult } from './validate.js';

export interface ExerciseCheck {
	description: string;
	validate: (parsed: unknown, raw: string) => boolean;
}

export interface PracticeExercise {
	id: string;
	title: string;
	instructions: string;
	starterCode?: string;
	hints?: string[];
	checks: ExerciseCheck[];
}

export interface CheckResult {
	description: string;
	passed: boolean;
}

/**
 * Run all exercise checks against parsed YAML.
 * Checks run against the parsed data structure (not raw text)
 * unless the check explicitly needs raw text (e.g., formatting lessons).
 */
export function evaluateExercise(
	exercise: PracticeExercise,
	validation: ValidationResult,
	raw: string
): CheckResult[] {
	return exercise.checks.map((check) => ({
		description: check.description,
		passed: validation.valid && check.validate(validation.parsed, raw)
	}));
}

/** True when every check passes. */
export function allChecksPassed(results: CheckResult[]): boolean {
	return results.length > 0 && results.every((r) => r.passed);
}

// --- Reusable check builders ---

/** Check that the parsed result is an object with a specific key. */
export function hasKey(key: string): ExerciseCheck {
	return {
		description: `Has a key called "${key}"`,
		validate: (parsed) => isRecord(parsed) && key in parsed
	};
}

/** Check that a key exists and its value is a string. */
export function hasStringKey(key: string): ExerciseCheck {
	return {
		description: `"${key}" has a text (string) value`,
		validate: (parsed) => isRecord(parsed) && typeof parsed[key] === 'string'
	};
}

/** Check that a key exists and its value is a number. */
export function hasNumberKey(key: string): ExerciseCheck {
	return {
		description: `"${key}" has a number value`,
		validate: (parsed) => isRecord(parsed) && typeof parsed[key] === 'number'
	};
}

/** Check that a key exists and its value is a boolean. */
export function hasBooleanKey(key: string): ExerciseCheck {
	return {
		description: `"${key}" has a boolean value (true/false)`,
		validate: (parsed) => isRecord(parsed) && typeof parsed[key] === 'boolean'
	};
}

/** Check that a key exists and its value is an array. */
export function hasListKey(key: string): ExerciseCheck {
	return {
		description: `"${key}" is a list`,
		validate: (parsed) => isRecord(parsed) && Array.isArray(parsed[key])
	};
}

/** Check that a key exists and its value is an array with at least N items. */
export function hasListWithMinItems(key: string, min: number): ExerciseCheck {
	return {
		description: `"${key}" has at least ${min} item${min === 1 ? '' : 's'}`,
		validate: (parsed) => isRecord(parsed) && Array.isArray(parsed[key]) && parsed[key].length >= min
	};
}

/** Check that parsed result has a nested key path (e.g., ['server', 'port']). */
export function hasNestedKey(path: string[]): ExerciseCheck {
	return {
		description: `Has nested key: ${path.join(' → ')}`,
		validate: (parsed) => {
			let current: unknown = parsed;
			for (const key of path) {
				if (!isRecord(current) || !(key in current)) return false;
				current = current[key];
			}
			return true;
		}
	};
}

/** Check that a comment exists in the raw text. */
export function hasComment(): ExerciseCheck {
	return {
		description: 'Includes at least one comment (starts with #)',
		validate: (_parsed, raw) => raw.split('\n').some((line) => line.trim().startsWith('#'))
	};
}

/** Check minimum number of top-level keys. */
export function hasMinKeys(min: number): ExerciseCheck {
	return {
		description: `Has at least ${min} top-level key${min === 1 ? '' : 's'}`,
		validate: (parsed) => isRecord(parsed) && Object.keys(parsed).length >= min
	};
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}
