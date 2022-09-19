import { env } from '$env/dynamic/private';
import { AuthSession } from '$lib/auth';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';
import { PrismaClient } from '@prisma/client';
import type { Handle } from '@sveltejs/kit';

const prisma = new PrismaClient({ log: [{ emit: 'stdout', level: 'query' }] });

export const handle: Handle = async ({ event, resolve }) => {
	event.locals = {
		prisma,
		auth: new AuthSession(event, env.SESSION_SECRET || 'invalid', prisma),
	};

	return resolve(event);
};
