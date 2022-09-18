import type { WorkflowRun } from '@octokit/webhooks-types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const rawRuns = await locals.prisma.run.findMany({
		include: { jobs: { orderBy: { started_at: 'asc' } } },
		where: { workflow_id: parseInt(params.workflow, 10), ref: params.ref },
		orderBy: { started_at: 'desc' },
		take: 50,
	});

	const columnSet = new Set<string>();
	for (const run of rawRuns) {
		for (const job of run.jobs) {
			job.name && columnSet.add(job.name);
		}
	}
	const columns = [...columnSet];
	const runs = rawRuns.map(({ jobs, ...run }) => {
		const jobMap = new Map(jobs.map((job) => [job.name!, job]));
		return { ...run, jobs: columns.map((col) => jobMap.get(col)) };
	});

	const workflowName = (runs[0].data as unknown as WorkflowRun).name;

	return { columns, runs, workflowName };
};

function iteratorToStream<T>(iterator: AsyncIterator<T, T>) {
	return new ReadableStream<T>({
		async pull(controller) {
			const { value, done } = await iterator.next();

			if (done) {
				controller.close();
			} else {
				controller.enqueue(value);
			}
		},
	});
}
