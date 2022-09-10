import { PrismaClient } from '@prisma/client';
import type { Handle } from '@sveltejs/kit';

const prisma = new PrismaClient({ log: [{ emit: 'stdout', level: 'query' }] });

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.prisma = prisma;
	return resolve(event);
};
