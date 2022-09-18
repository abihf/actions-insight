import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	const access = await locals.auth.repoAccess(params.org, params.repo);
	if (!access) throw new Error('');

	return {};
};
