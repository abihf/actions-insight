import { listRepo } from '$lib/accessor/repo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const auth = await locals.auth.value();
	if (!auth) throw new Error('unauthenticated');

	const repos = await listRepo(locals.prisma, auth.gh.id);
	return { repos };
};
