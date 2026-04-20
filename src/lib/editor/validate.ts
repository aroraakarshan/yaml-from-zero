import { parseDocument, type Document } from 'yaml';

export interface ValidationError {
	line: number;
	col: number;
	message: string;
	severity: 'error' | 'warning';
}

export interface ValidationResult {
	valid: boolean;
	errors: ValidationError[];
	parsed: unknown;
	document: Document | null;
}

/**
 * Parse YAML text and return structured validation results.
 * Uses YAML 1.2 core schema with duplicate-key detection.
 */
export function validateYaml(text: string): ValidationResult {
	if (!text.trim()) {
		return { valid: true, errors: [], parsed: null, document: null };
	}

	const doc = parseDocument(text, {
		schema: 'core',
		uniqueKeys: true,
		strict: true
	});

	const errors: ValidationError[] = [];

	for (const err of doc.errors) {
		const pos = err.pos?.[0] ?? 0;
		const { line, col } = offsetToLineCol(text, pos);
		errors.push({
			line,
			col,
			message: cleanErrorMessage(err.message),
			severity: 'error'
		});
	}

	for (const warn of doc.warnings) {
		const pos = warn.pos?.[0] ?? 0;
		const { line, col } = offsetToLineCol(text, pos);
		errors.push({
			line,
			col,
			message: cleanErrorMessage(warn.message),
			severity: 'warning'
		});
	}

	let parsed: unknown = null;
	if (doc.errors.length === 0) {
		try {
			parsed = doc.toJS();
		} catch {
			// If toJS fails despite no parse errors, treat as invalid
		}
	}

	return {
		valid: errors.filter((e) => e.severity === 'error').length === 0,
		errors,
		parsed,
		document: doc
	};
}

/** Convert a character offset to 1-based line and column. */
function offsetToLineCol(text: string, offset: number): { line: number; col: number } {
	let line = 1;
	let col = 1;
	for (let i = 0; i < offset && i < text.length; i++) {
		if (text[i] === '\n') {
			line++;
			col = 1;
		} else {
			col++;
		}
	}
	return { line, col };
}

/** Strip internal yaml package prefixes from error messages. */
function cleanErrorMessage(msg: string): string {
	return msg.replace(/^(Map keys must be unique|Implicit keys need to be on a single line)/, (m) => m);
}

/**
 * Get per-line validation status.
 * Returns an array where index = 0-based line number,
 * value = null (no error on this line) or the first error on that line.
 */
export function getLineErrors(
	result: ValidationResult,
	lineCount: number
): (ValidationError | null)[] {
	const lineErrors: (ValidationError | null)[] = new Array(lineCount).fill(null);
	for (const err of result.errors) {
		const idx = err.line - 1;
		if (idx >= 0 && idx < lineCount && !lineErrors[idx]) {
			lineErrors[idx] = err;
		}
	}
	return lineErrors;
}
