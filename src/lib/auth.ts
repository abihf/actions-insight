import type { PrismaClient } from '@prisma/client';
import type { RequestEvent } from '@sveltejs/kit';
import type { BinaryLike } from 'node:crypto';
import type { Readable } from 'svelte/store';
import { Session } from './session';

export class AuthSession extends Session<AuthData> {
	constructor(event: RequestEvent, secret: BinaryLike, private prisma: PrismaClient) {
		super(event, secret);
	}

	async repoAccess(org: string, repo: string) {
		const auth = await this.value();
		if (!auth) return;

		const row = await this.prisma.repoAccess.findFirst({
			select: { type: true },
			where: { user_id: BigInt(auth.gh.id), repo: { owner: org, name: repo } },
		});

		return row?.type;
	}
}
export interface AuthData {
	gh: {
		token: string;
		id: string;
		login: string;
		name: string | null;
	};
}
