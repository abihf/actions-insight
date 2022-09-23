import { listRepo } from '$lib/accessor/repo';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const auth = await locals.auth.value();
	if (!auth) {
		throw redirect(
			302,
			'/login?' + new URLSearchParams({ next: url.pathname + (url.search || '') }),
		);
	}

	const repos = await listRepo(locals.prisma, auth.gh.id);
	return { repos };
};
