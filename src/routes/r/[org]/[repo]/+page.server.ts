import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const workflows = await locals.prisma.workflow.findMany({
		where: { repo: { owner: params.org, name: params.repo } },
	});
	return { workflows };
};
