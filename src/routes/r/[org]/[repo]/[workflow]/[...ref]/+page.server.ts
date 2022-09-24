import type { PageServerLoad } from './$types';
import type { WorkflowRun } from '@octokit/webhooks-types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const runs = await locals.prisma.run.findMany({
		include: { jobs: { orderBy: { started_at: 'asc' } } },
		where: { workflow_id: BigInt(params.workflow), ref: params.ref },
		take: 50,
		orderBy: { started_at: 'desc' }
	});

	const workflowName = (runs[0].data as unknown as WorkflowRun).name;

	return { runs, workflowName };
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
		}
	});
}
