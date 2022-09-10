import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const rows = await locals.prisma.run.findMany({
		select: { ref: true },
		where: { workflow_id: parseInt(params.workflow, 10) },
		distinct: ['ref']
	});
	const refs = rows.map((r) => extractRef(r.ref));
	refs.sort((a, b) => {
		if (a.priority !== b.priority) {
			return a.priority - b.priority;
		}
		if (a.isPR && b.isPR) {
			return b.prNumber - a.prNumber;
		}
		if (!a.isPR && !b.isPR) {
			return a.branch.localeCompare(b.branch);
		}
		return 0;
	});
	return { refs: refs.map((r) => r.name) };
};

type RefInfo = { priority: number; name: string } & (
	| {
			isPR: true;
			prNumber: number;
	  }
	| {
			isPR: false;
			branch: string;
	  }
);
function extractRef(name: string): RefInfo {
	const isPR = name.startsWith('pull/');
	if (isPR) {
		const num = name.split('/')[1];
		return {
			name,
			isPR,
			prNumber: num === 'unknown' ? 0 : parseInt(num, 10),
			priority: 2
		};
	} else {
		return {
			name,
			isPR,
			branch: name.replace(/^head\//, ''),
			priority: 1
		};
	}
}
