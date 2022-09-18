export function ensure<T>(v: T | null | undefined, msg = 'null value'): T {
	if (v) return v;
	throw new Error(msg);
}
