import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const repos = await locals.prisma.repo.findMany({});
	return { repos };
};
