import type { RequestEvent } from '@sveltejs/kit';
import { createHmac, randomInt, type BinaryLike } from 'crypto';
import { setTimeout } from 'timers/promises';

type SessionData<T> = T & { exp: number };

const COOKIE_VALUE = 'authv';
const COOKIE_SIGNATURE = 'auths';

export class Session<T> {
	#dataPromise: Promise<SessionData<T> | undefined> | undefined;

	constructor(private event: RequestEvent, private secret: BinaryLike) {}

	value() {
		if (!this.#dataPromise) {
			this.#dataPromise = this.#validate();
		}
		return this.#dataPromise;
	}

	update(data: T, exp = Date.now()) {
		const serialized = Buffer.from(JSON.stringify({ ...data, exp }), 'utf8').toString('base64url');
		const signature = this.hmac(serialized);
		this.event.cookies.set(COOKIE_VALUE, serialized);
		this.event.cookies.set(COOKIE_SIGNATURE, signature);
	}

	async #validate() {
		const value = this.event.cookies.get(COOKIE_VALUE);
		if (!value) return;
		const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as SessionData<T>;
		if (parsed.exp >= Date.now()) {
			// throw new Error('session is expired')
			return;
		}
		const signature = this.event.cookies.get(COOKIE_SIGNATURE);
		if (!signature) throw new Error('cookie signature not found');
		if (signature !== this.hmac(value)) {
			await setTimeout(randomInt(50));
			throw new Error('cookie signature is not valid');
		}
		return parsed;
	}

	private hmac(data: BinaryLike) {
		return createHmac('sha256', this.secret).update(data).digest('base64url');
	}
}
