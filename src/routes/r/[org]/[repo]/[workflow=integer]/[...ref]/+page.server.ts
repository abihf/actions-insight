import type { WorkflowRun } from '@octokit/webhooks-types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const runs = await locals.prisma.run.findMany({
		include: { jobs: { orderBy: { started_at: 'asc' } } },
		where: { workflow_id: parseInt(params.workflow, 10), ref: params.ref },
		orderBy: { started_at: 'desc' },
		take: 50,
	});

	const workflowName = (runs[0].data as unknown as WorkflowRun).name;

	return { runs, workflowName };
};
